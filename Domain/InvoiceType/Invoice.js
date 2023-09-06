import { config as afip_selectors } from '../../Domain/Constants/afip_selectors.js';
import { constants as afip_constants } from '../../Domain/Constants/afip_constants.js';

// TODO: Add handling for multiple item lines
export default class Invoice {
    selectors;

    constructor() {
        this.selectors = afip_selectors;
    }
    
    async nextStep() {
        await this.page.waitForTimeout(1000);
        await this.page.click(this.selectors.rcel.continuar);
    }

    async clearInput(selector) {
        await this.page.$eval(selector, (el) => el.value = '');
    }

    async selectPOS() {
        await this.page.waitForSelector(this.selectors.rcel.punto_venta, {visible: true});
        await this.page.select(this.selectors.rcel.punto_venta, this.data.punto_venta);
    }

    async pickInvoiceType(type) {
        const invoiceTypeId = afip_constants.tipo_comprobante[type];

        await this.page.waitForTimeout(1000);
        await this.page.select(this.selectors.rcel.tipo_comprobante, invoiceTypeId);
        
        await this.nextStep();
    }

    async step3 () {
        await this.page.waitForSelector(this.selectors.rcel.descripcion, {visible: true});
        await this.page.type(this.selectors.rcel.descripcion, this.data.descripcion);
        await this.page.select(this.selectors.rcel.medida, this.data.medida); 
        await this.page.type(this.selectors.rcel.monto, this.data.monto);

        await this.nextStep();
    }
}