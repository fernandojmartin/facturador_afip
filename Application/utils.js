import chalk from 'chalk';
import { readFileSync } from 'fs';
import { Table } from 'console-table-printer';

const today = (addDays = 0) => {
    const d = new Date();
    if(addDays != 0) 
        d.setDate(d.getDate() + addDays);

    return [d.getDate(), d.getMonth()+1, d.getFullYear()]
        .map(n => n < 10 ? `0${n}` : `${n}`).join("/");
}

const todayMonthFirst = (addDays = 0) => {
    const d = new Date();
    if(addDays != 0) 
        d.setDate(d.getDate() + addDays);

    return [d.getMonth()+1, d.getDate(), d.getFullYear()]
        .map(n => n < 10 ? `0${n}` : `${n}`).join("-");
}

const printBool = (result) => {
    return (result === true) ? chalk.green('[ OK ]') : chalk.red('[ ERROR ]');
}

const loadJsonFile = (file) => {
    return JSON.parse(
        readFileSync(file, {encoding:'utf8', flag:'r'})
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

export {
    today,
    printBool,
    loadJsonFile,
    countInvoices,
    printInvoicesStats,
    todayMonthFirst,
}