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
        const invoiceClassPath = `./InvoiceType/${type}`;
        const invoiceClass = require(invoiceClassPath);

        return new invoiceClass(this.page, this.data);
    }
}
