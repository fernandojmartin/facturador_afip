const chalk = require('chalk');
const fs = require('fs');

const printBool = (result) => {
    return (result === true) ? chalk.green('[ OK ]') : chalk.red('[ ERROR ]');
}

const loadJsonFile = (file) => {
    return JSON.parse(
        fs.readFileSync(file, {encoding:'utf8', flag:'r'})
    );
}

module.exports = {
    printBool,
    loadJsonFile
}