/**
 * Simple robot para generar comprobantes de AFIP
 *
 * @author Fernando J. Martin <fernandojmartin@gmail.com>
 * @version 0.1.1 2021-02-28
 */

// Load the error & exception handlers
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1);
})

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
})

import { runBot } from './main.js';
import { contribuyenteSchema } from './Domain/Models/contribuyente.js';
import chalk from 'chalk';
import { createPromptModule } from 'inquirer';
const prompt = createPromptModule();
import { fileExists, hasAllKeys, invoiceStructure } from './Application/validations.js';
import { loadJsonFile, printBool, printInvoicesStats } from './Application/utils.js';

const exec = async () =>
{
    const questions = [
        {
            type: "input",
            name: "data_file",
            message: 'Archivo de datos?',
            // default: 'data_fjm.json',
            validate: (data_file) => {
                if (!fileExists(data_file)) {
                    return 'Error: No se encuentra el archivo de datos';
                }
                return true;
            }
        },
    ];

    try {
        const answers = await prompt(questions);

        //////// ==== VALIDATIONS ===== \\\\\\\\
        const data = loadJsonFile(answers.data_file);

        const allkeys = hasAllKeys(data, ['contribuyente', 'comprobantes']);
        process.stdout.write(chalk.cyan('Comprobando estructura básica del archivo de datos: '));
        console.log(printBool(allkeys));

        process.stdout.write(chalk.cyan('Comprobando estructura de datos del contribuyente: '));
        await contribuyenteSchema.validate(data.contribuyente);
        console.log(printBool(true));

        process.stdout.write(chalk.cyan('Verificando estructura y datos de los comprobantes: '));
        invoiceStructure(data.comprobantes);
        console.log(printBool(true));


        //////// ==== CONFIRMATIONS ===== \\\\\\\\
        const contribuyente = `"${chalk.cyanBright(data.contribuyente.nombre)}"`;
        printInvoicesStats(data.comprobantes);

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

        runBot(data.contribuyente, data.comprobantes, commitInvoice);

    } catch (e) {
        console.log(chalk.red(e));
    }
}

exec();
