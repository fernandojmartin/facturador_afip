const chalk = require('chalk');
const fs = require('fs');
const {Table} = require('console-table-printer');

const today = () => {
    const d = new Date();
    return [d.getMonth()+1, d.getDate(), d.getFullYear()]
        .map(n => n < 10 ? `0${n}` : `${n}`).join('-');
}

const printBool = (result) => {
    return (result === true) ? chalk.green('[ OK ]') : chalk.red('[ ERROR ]');
}

const loadJsonFile = (file) => {
    return JSON.parse(
        fs.readFileSync(file, {encoding:'utf8', flag:'r'})
    );
}

const countInvoices = (data) => {
    let stats = [];
    data.map((invoice) => stats[invoice.tipo] === undefined ?
        stats[invoice.tipo] = 1 :
        ++stats[invoice.tipo]
    );

    return stats;
}

const printInvoicesStats = (data) => {
    const stats = countInvoices(data);
    const table = new Table();
    Object.entries(stats).map((stat) => {
        table.addRow({Tipo: `'${stat[0]}'`, Cantidad: stat[1]})
    })
    table.printTable();
}

module.exports = {
    today,
    printBool,
    loadJsonFile,
    countInvoices,
    printInvoicesStats,
}