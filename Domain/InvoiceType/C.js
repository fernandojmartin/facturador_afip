const Invoice = require('./Invoice');

module.exports = class InvoiceTypeC extends Invoice {
    page;
    data;

    constructor(page, data) {
        super();

        this.page = page;
        this.data = data;
    }

    async step1() {
        await this.page.waitForSelector(this.selectors.rcel.fecha_comprobante, {visible: true});
        await this.page.waitForTimeout(250);
        
        await this.clearInput(this.selectors.rcel.fecha_comprobante);
        await this.page.type(this.selectors.rcel.fecha_comprobante, this.data.fecha);
        
        await this.page.select(this.selectors.rcel.concepto, this.data.concepto);
        
        await this.page.waitForSelector(this.selectors.rcel.periodo_desde, {visible: true});
        await this.page.waitForTimeout(250);
        await this.clearInput(this.selectors.rcel.periodo_desde);
        await this.page.type(this.selectors.rcel.periodo_desde, this.data.desde, {delay: 15});
        
        await this.clearInput(this.selectors.rcel.periodo_hasta);
        await this.page.type(this.selectors.rcel.periodo_hasta, this.data.hasta, {delay: 15});
        
        await this.clearInput(this.selectors.rcel.vencimiento_pago);
        await this.page.type(this.selectors.rcel.vencimiento_pago, this.data.vencimiento_pago, {delay: 15});

        this.nextStep();
    }

    async step2() {
        await this.page.waitForSelector(this.selectors.rcel.condicion_contribuyente, {visible: true});
        await this.page.select(this.selectors.rcel.condicion_contribuyente, this.data.tipo_receptor); 
        
        const paymentType = `pago_${this.data.forma_pago}`;
        await this.page.click(this.selectors.rcel[paymentType]);

        this.nextStep();
    }
}