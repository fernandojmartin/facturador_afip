import InvoiceTypeC from "./InvoiceType/C.js";
import InvoiceTypeE from "./InvoiceType/E.js";

export default class InvoiceFactory {
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
        if(type === "E") {
            return new InvoiceTypeE(this.page, this.data);
        }

        return new InvoiceTypeC(this.page, this.data);
    }
}
