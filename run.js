/**
 * Simple robot para generar comprobantes de AFIP
 *
 * @author Fernando J. Martin <fernandojmartin@gmail.com>
 * @version 0.1.1 2021-02-28
 */

// Load the error & exception handlers
require('./error_handlers');

const afip_bot = require('./main');
const contribuyenteModel = require('./Domain/Models/contribuyente').schema;
const chalk = require('chalk');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const validations = require('./Application/validations');
const utils = require('./Application/utils');

const exec = async () =>
{
    const questions = [
        {
            type: "input",
            name: "data_file",
            message: 'Archivo de datos?',
            // default: 'data_fjm.json',
            validate: (data_file) => {
                if (!validations.fileExists(data_file)) {
                    return 'Error: No se encuentra el archivo de datos';
                }
                return true;
            }
        },
    ];

    try {
        const answers = await prompt(questions);

        //////// ==== VALIDATIONS ===== \\\\\\\\
        const data = utils.loadJsonFile(answers.data_file);

        const allkeys = validations.hasAllKeys(data, ['contribuyente', 'comprobantes']);
        process.stdout.write(chalk.cyan('Comprobando estructura básica del archivo de datos: '));
        console.log(utils.printBool(allkeys));

        process.stdout.write(chalk.cyan('Comprobando estructura de datos del contribuyente: '));
        await contribuyenteModel.validate(data.contribuyente);
        console.log(utils.printBool(true));

        process.stdout.write(chalk.cyan('Verificando estructura y datos de los comprobantes: '));
        validations.invoiceStructure(data.comprobantes);
        console.log(utils.printBool(true));


        //////// ==== CONFIRMATIONS ===== \\\\\\\\
        const contribuyente = `"${chalk.cyanBright(data.contribuyente.nombre)}"`;
        utils.printInvoicesStats(data.comprobantes);

        const {ok_contribuyente} = await prompt([{
            type: 'confirm',
            name: 'ok_contribuyente',
            message: 'Confirma que va a trabajar con el contribuyente ' + contribuyente + ' ?',
        }]);
        if (ok_contribuyente === false) {
            process.exit(0);
        }

        const {commitInvoice} = await prompt([{
            type: "confirm",
            name: "commitInvoice",
            default: false,
            message: 'Desea generar los comprobantes? (Por defecto sólo se simula)',
        }
        ]);

        afip_bot.run(data.contribuyente, data.comprobantes, commitInvoice);

    } catch (e) {
        console.log(chalk.red(e));
    }
}

exec();
