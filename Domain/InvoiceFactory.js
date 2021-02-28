const afip_constants = require('./Constants/afip_constants');

module.exports = class InvoiceFactory {
    page;
    data;

    constructor(page, data) {
        this.page = page;
        this.data = data;
    }

    /**
     * @param {string|number} type 
     * @returns {Invoice}
     */
    build(type) {
        const invoiceType = afip_constants.tipo_comprobante[type];
        const invoiceClassPath = `./InvoiceType/${invoiceType}`;
        const invoiceClass = require(invoiceClassPath);

        return new invoiceClass(this.page, this.data);
    }
}
