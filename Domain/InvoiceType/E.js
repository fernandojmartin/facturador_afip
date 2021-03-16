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
        await this.clearInput(this.selectors.rcel.fecha_comprobante);
        await this.page.type(this.selectors.rcel.fecha_comprobante, this.data.fecha, {delay: 15});
        await this.page.select(this.selectors.rcel.concepto, this.data.concepto);

        this.nextStep();
    }

    async step2() {
        await this.page.waitForSelector(this.selectors.rcel.destino, {visible: true});
        await this.page.select(this.selectors.rcel.destino, this.data.destino); 
        await this.page.type(this.selectors.rcel.tipo_receptor, this.data.tipo_receptor, {delay: 50}); 
        await this.page.type(this.selectors.rcel.id_receptor, this.data.id_receptor, {delay: 50}); 
        await this.page.type(this.selectors.rcel.razon_social, this.data.razon_social, {delay: 25}); 
        await this.page.type(this.selectors.rcel.domicilio, this.data.domicilio, {delay: 10}); 
        await this.page.type(this.selectors.rcel.forma_pago, this.data.forma_pago);

        this.nextStep();
    }
}