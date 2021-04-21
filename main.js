/**
 * Simple robot para generar comprobantes de AFIP
 * 
 * @author Fernando J. Martin <fernandojmartin@gmail.com>
 * @version 0.2.0 2021-03-29
 */

const puppeteer = require('puppeteer');
const selectors = require('./Domain/Constants/afip_selectors');
const constants = require('./Domain/Constants/afip_constants');
const InvoiceFactory = require('./Domain/InvoiceFactory');
const Logger = require('./logger');
const log = new Logger();

const run = async (contribuyente, comprobantes, commitInvoice) => {

    const browser = await puppeteer.launch({headless: false /*, slowMo: 100, devtools: true,*/})
    const page = await browser.newPage()
    await page.setViewport({ width: 900, height: 2000 });
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
        log.phase('INICIANDO SESION');
        await logIn(page, contribuyente);

        log.phase('ENTRANDO A RCEL');
        await page.waitForSelector(selectors.navegacion.rcel, {visible: true});
        await page.click(selectors.navegacion.rcel);
        const newPagePromise = getNewPageWhenLoaded(); // RCEL se abre en una nueva pestaña!
        
        /**
         * @type {Page}
         */
        const newPage = await newPagePromise;
        await newPage.setViewport({ width: 900, height: 2000 });

        /* Capture & manage alert-boxes */
        await newPage.on('dialog', async (dialog) => { 
            await newPage.waitForTimeout(1500);

            /* Generar comprobante? */
            if (dialog.message().match(/generar un nuevo comprobante/i)) {
                commitInvoice ? dialog.accept() : dialog.dismiss();
            }

            /* Salir de RCEL? */
            if (dialog.message().match(/salir de la aplicación/i)) {
                await dialog.accept();
            }
        });

        log.phase(`SELECCIONANDO PERSONA REPRESENTADA '${contribuyente.nombre}'`);
        await newPage.click(selectors.navegacion.representada.replace('<nombre-contribuyente>', contribuyente.nombre));

        // Emit each invoice...
        log.phase(`COMIENZA GENERACION DE ${comprobantes.length} COMPROBANTES`)
        await generateInvoices(comprobantes, commitInvoice, newPage);
        log.phase('TODOS LOS COMPROBANTES GENERADOS!')

        log.phase('SALIENDO DE RCEL');
        await newPage.click(selectors.rcel.salir);

        log.phase('CERRAR SESION Y NAVEGADOR')
        await logOut(page);
        await page.waitForTimeout(1500);
        await browser.close();

    } catch (e) {
        console.error(e);
    }
};

/**
 * Inicia sesión en AFIP
 *
 * @param page {Page}
 * @param contribuyente {{cuit: string, clave: string}}
 * @returns {Promise<void>}
 */
const logIn = async (page, contribuyente) => {
    await page.waitForSelector(selectors.login.cuit);
    await page.waitForSelector(selectors.login.siguiente);

    log.step('Ingresando CUIT');
    await page.type(selectors.login.cuit, contribuyente.cuit,{delay: 50});
    await page.click(selectors.login.siguiente);

    log.step('Ingresando contraseña');
    await page.waitForSelector(selectors.login.clave);
    await page.waitForSelector(selectors.login.ingresar);
    await page.type(selectors.login.clave, contribuyente.clave);

    log.step('Iniciando sesión');
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
 * @param commitInvoice {boolean}
 * @param {import('puppeteer').Page} page
 */
const generateInvoices = async (invoices, commitInvoice,  page) => {
    let counter = 0;
    for (const invoiceData of invoices) {
        counter++;
        log.step(`Generar comprobante ${counter}/${invoices.length} - Tipo '${invoiceData.tipo}' por $ ${invoiceData.monto}`);
        await page.waitForSelector(selectors.rcel.generar_comprobante, {visible: true});
        await page.click(selectors.rcel.generar_comprobante);

        const factory = new InvoiceFactory(page, invoiceData);
        const invoice = factory.build(invoiceData.tipo);

        log.step('Seleccionar punto de venta');
        await invoice.selectPOS();

        log.step('Seleccionar tipo de comprobante');
        await invoice.pickInvoiceType(invoiceData.tipo);

        log.substep('Paso #1 - Fecha y concepto');
        await invoice.step1();

        log.substep('Paso #2 - Datos del contribuyente');
        await invoice.step2();
        
        log.substep('Paso #3 - Item(s)');
        await invoice.step3();
        
        log.substep('Paso #4 - Confirmar');
        await page.waitForSelector(selectors.rcel.confirmar, {visible: true}); 
        
        log.step('TIEMPO PARA CORROBORAR: 5 segundos...');
        await page.waitForTimeout(5000);
        await page.click(selectors.rcel.confirmar); 
        
        if (commitInvoice) {
            await page.waitForSelector(selectors.rcel.comprobante_generado);
        }
        await page.waitForTimeout(1000);

        log.step('Volviendo al menu principal');
        log.step('---------------------------');
        await page.click(selectors.rcel.menu_principal);
    }
}



module.exports = {run};