process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node docs)
})

process.on('unhandledRejection', (err) => {
    console.error(err)
    process.exit(1) //mandatory (as per the Node docs)
})

const contribuyente = require('./Domain/Models/contribuyente').schema;
const chalk = require('chalk');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const validations = require('./Application/validations');
const utils = require('./Application/utils');
const questions = [
    {
        type: "input",
        name: "data_file",
        message: 'Archivo de datos?',
        default: 'data_fjm.json',
        validate: (data_file) => {
            if (!validations.fileExists(data_file)) {
                return 'Error: No se encuentra el archivo de datos';
            }
            return true;
        }
    },
    {
        type: "confirm",
        name: "apply_transaction",
        default: false,
        message: 'Desea generar los comprobantes? (Por defecto sólo se simula)',
    }
];

prompt(questions)
    .then((answers) => {
        const data = utils.loadJsonFile(answers.data_file);

        let result = validations.hasAllKeys(data, ['contribuyente', 'comprobantes']);
        console.log(chalk.cyan(`Comprobando estructura básica del archivo de datos: ${utils.printBool(result)}`));

        console.log(chalk.cyan(`Comprobando estructura de datos del contribuyente: ${utils.printBool(result)}`));
        result = contribuyente.validate(data.contribuyente);

        prompt([{
            type: 'confirm',
            name:'ok_contribuyente',
            message: 'Confirma que va a trabajar con el contribuyente ' + chalk.red(data.contribuyente.nombre) + ' ?',
        }]).then(() => {
            validations.invoiceStructure(data.comprobantes);
        });
    })
    .catch((e) =>
        console.log(chalk.red(e))
    );


// bot.run(options);