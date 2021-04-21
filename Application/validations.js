const fs = require('fs');
const chalk = require("chalk");
const {printBool} = require("./utils");

/**
 * Filters object's keys and returns the ones missing from the given keys list
 *
 * @param {Object} object
 * @param {array<string>} keys
 * @returns {array<string>}
 */
const objectContainsKeys = (object, keys) => {
    return  keys.filter(x => !Object.keys(object).includes(x));
}

/**
 * Checks the given object contains all the given keys
 *
 * @param {Object} object
 * @param {array<string>} keys
 * @returns {boolean}
 */
const hasAllKeys = (object, keys) => {
    return objectContainsKeys(object, keys).length === 0;
}

/**
 * Validate a collection of invoices against their corresponding models
 *
 * @param {array<Object>} data
 * @throws Error
 */
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
            let msg = printBool(false)+'\n'+chalk.red(message)+'\n'+chalk.white(value);

            process.stdout.write(msg);
            process.exit(1);
        } 
    }
}

/**
 * Check the file exists
 *
 * @param {string} file The file path relative tu current working dir
 * @returns {boolean}
 */
const fileExists = (file) => fs.existsSync(file);

module.exports = {
    objectContainsKeys,
    hasAllKeys,
    invoiceStructure,
    fileExists,
}