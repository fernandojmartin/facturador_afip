const fs = require('fs');

const objectContainsKeys = (object, keys) => {
    return  keys.filter(x => !Object.keys(object).includes(x));
}

const hasAllKeys = (object, keys) => {
    return objectContainsKeys(object, keys).length === 0;
}



const invoiceStructure = (data) => {
    const models = require(`../Domain/Models`);

    for (const invoice of data) {
        const type = invoice.tipo;
        const model = models[type];
        if (model === undefined) {
            throw Error(`El sistema no soporta comprobantes tipo '${type}'`)
        }
        const { schema } = model;
        const isValid = schema.validate(invoice);
        if (isValid.error) {
            let message = isValid.error.details[0].message;
            let value = JSON.stringify(isValid.value, undefined, 2); 
            let msg = `${message}\n${value}`;
            throw Error(msg);
        } 
    }
}

const fileExists = (file) => fs.existsSync(file);

module.exports = {
    objectContainsKeys,
    hasAllKeys,
    invoiceStructure,
    fileExists,
}