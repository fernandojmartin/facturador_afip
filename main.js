/**
 * Simple robot para generar comprobantes de AFIP
 * 
 * @author Fernando J. Martin <fernandojmartin@gmail.com>
 * @version 0.1.1 2021-02-28
 */

const puppeteer = require('puppeteer');
const selectors = require('./Domain/Constants/afip_selectors');
const constants = require('./Domain/Constants/afip_constants');
const InvoiceFactory = require('./Domain/InvoiceFactory');

const run = async (options) => {
    // await preCheck(options.dataFile);

    const data = require(options.dataFile);
    const browser = await puppeteer.launch({headless: false /*, slowMo: 1000, devtools: true,*/})
    const page = await browser.newPage()
    await page.setViewport({ width: 900, height: 720 });
    await page.goto(constants.url);

    const getNewPageWhenLoaded =  async () => {
        return new Promise(x =>
            browser.on('targetcreated', async target => {
                if (target.type() === 'page') {
                    const newPage = await target.page();
                    const newPagePromise = new Promise(y =>
                        newPage.once('domcontentloaded', () => y(newPage))
                    );
                    const isPageLoaded = await newPage.evaluate(
                        () => document.readyState
                    );
                    return isPageLoaded.match('complete|interactive')
                        ? x(newPage)
                        : x(newPagePromise);
                }
            })
        );
    };

    try {
        log('## INICIANDO SESION');
        await logIn(page, data);

        log("\n## ENTRANDO A RCEL");
        await page.waitForSelector(selectors.navegacion.rcel, {visible: true});
        await page.click(selectors.navegacion.rcel);
        const newPagePromise = getNewPageWhenLoaded(); // RCEL se abre en una nueva pestaña!
        
        /**
         * @type {Page}
         */
        const newPage = await newPagePromise;

        // Capture & manage alert-boxes
        await newPage.on('dialog', async (dialog) => { 
            log(dialog.message());

            await newPage.waitForTimeout(1500);
            console.log(options.applyTransaction ? 'apply transaction' : 'simulate');

            /* Generar comprobante? */
            if (dialog.message().match(/generar un nuevo comprobante/i)) {
                // options.applyTransaction ? dialog.accept() : dialog.dismiss();
                
                dialog.dismiss(); log('~~ Alert Dismissed ~~');
            }

            /* Salir de RCEL? */
            if (dialog.message().match(/salir de la aplicación/i)) {
                await dialog.accept();
                log('~~ Alert Accepted ~~');
            }
        });

        log(`\n## SELECCIONANDO PERSONA REPRESENTADA '${data.contribuyente.nombre}'`);
        await newPage.click(selectors.navegacion.representada.replace('<nombre-contribuyente>', data.contribuyente.nombre));

        // Emit each invoice...
        log(`\n## COMIENZA GENERACION DE ${data.comprobantes.length} COMPROBANTES`)
        await generateInvoices(data.comprobantes, newPage);
        log('\n## TODOS LOS COMPROBANTES GENERADOS!')

        log('\n## SALIENDO DE RCEL');
        await newPage.click(selectors.rcel.salir);

        log('\n## CERRAR SESION Y NAVEGADOR')
        await logOut(page);
        await page.waitForTimeout(1500);
        await browser.close();

    } catch (e) {
        console.error(e);
    }
};

// const hasAllKeys = (object, keys) => {
//     keys.map((prop) => {
//         if(object.hasOwnProperty(prop) === false) {
//             throw new Error(`La propiedad '${prop}' es requerida.`)
//         }
//     });
//     return true;
// }

const preCheck = async (dataFile) => {
    const fs = require('fs');
    try {
        log(`comprobando que el archivo de datos '${dataFile}' existe: `);
        if (fs.existsSync(dataFile) === true) {
            log('[ OK ]'); 
        } else {
            throw new Error('El archivo de datos no existe');
        }

        const data = require(dataFile);
        log('Comprobando estructura básica del archivo de datos: ');
        if (hasAllKeys(data, ['contribuyente','comprobantes'])) {
            log('[ OK ]');
        } 
        
        log('Comprobando estructura de datos del contribuyente: ');
        if (hasAllKeys(data.contribuyente, ['cuit','clave', 'nombre'])) {
            log('[ OK ]');
        }

        // log('Comprobando estructura de los comprobantes: ');
        // invoiceStructureChecker(data.comprobantes);

    } catch(e) {
        console.error(e);
    } 
}

const invoiceStructureChecker = (invoiceData) => {
    // TODO: Implement Joi() or other validator schema
    const formats = {
        "C": ['tipo','punto_venta','fecha','concepto','desde','hasta','vencimiento_pago','tipo_receptor','pago','descripcion','medida','monto'],
        "E": ['tipo','punto_venta','fecha','concepto','destino','tipo_receptor','id_receptor','razon_social','domicilio','forma_pago','descripcion','medida','monto'],
    }
    for (data of invoiceData) {
        console.log('DATA:', data);
        if (!data.hasOwnProperty('tipo')) {
            throw new Error(`El tipo de comprobante es requerido @ [${invoiceData.indexOf(data)}] \n${data}`);
        }

        if (formats.hasOwnProperty(data.tipo)) {
            throw new Error(`El tipo de comprobante no es válido @ [${invoiceData.indexOf(data)}] \n${data}`)
        }
    }
}


/**
 * Inicia sesión en AFIP
 *
 * @param page {Page}
 * @param data {Object<"./data.example.json">}
 * @returns {Promise<void>}
 */
const logIn = async (page, data) => {
    await page.waitForSelector(selectors.login.cuit);
    await page.waitForSelector(selectors.login.siguiente);

    log(' > Ingresando CUIT');
    await page.type(selectors.login.cuit, data.contribuyente.cuit,{delay: 50});
    await page.click(selectors.login.siguiente);

    log(' > Ingresando contraseña');
    await page.waitForSelector(selectors.login.clave);
    await page.waitForSelector(selectors.login.ingresar);
    await page.type(selectors.login.clave, data.contribuyente.clave,{delay: 50});

    log(' > Iniciando sesión');
    await page.click(selectors.login.ingresar);
    await page.waitForNavigation({waitUntil: ['domcontentloaded', 'networkidle2']});
}

/**
 * Cierra sesión en AFIP
 * 
 * @param {Page} page 
 */
const logOut = async (page) => {
    await page.waitForTimeout(1000);
    await page.click(selectors.navegacion.salir);
    await page.waitForTimeout(1500);
}

/**
 * Genera cada uno de los comprobantes en el archivo de datos
 * 
 * @param {Object} invoices 
 * @param {import('puppeteer').Page} page 
 */
const generateInvoices = async (invoices, page) => {
    for (const invoiceData of invoices) {
        log(` > Generar comprobante tipo '${invoiceData.tipo}'`);
        await page.waitForSelector(selectors.rcel.generar_comprobante, {visible: true});
        await page.click(selectors.rcel.generar_comprobante);

        const factory = new InvoiceFactory(page, invoiceData);
        const invoice = factory.build(invoiceData.tipo);

        log(" > Seleccionar punto de venta");
        await invoice.selectPOS();

        log(" > Seleccionar tipo de comprobante");
        await invoice.pickInvoiceType(invoiceData.tipo);

        log('  ~ Paso #1 - Fecha y concepto');
        await invoice.step1();

        log('  ~ Paso #2 - Datos del contribuyente');
        await invoice.step2();
        
        log('  ~ Paso #3 - Item(s)');
        await invoice.step3();
        
        log('  ~ Paso #4 - Confirmar');
        await page.waitForSelector(selectors.rcel.confirmar, {visible: true}); 
        
        log(' > TIEMPO PARA CORROBORAR: 3 segundos...');
        await page.waitForTimeout(3000);
        await page.click(selectors.rcel.confirmar); 
        
        // if (options.applyTransaction) { 
            await page.waitForSelector(selectors.rcel.comprobante_generado);
        // }
        await page.waitForTimeout(1000);

        log(" > Volviendo al menu principal");
        await page.click(selectors.rcel.menu_principal);
    }
}

/**
 * Escribe datos a la consola
 *
 * @param data
 */
const log = (data) => {
    console.log(typeof data === "string" ? data : {...data});
}

module.exports = {run};