const bot = require('./main');

const { program } = require('commander');

program
  .option('-d, --data-file <file>', 'El nombre del archivo con los datos')
  .parse();

const options = program.opts();

console.log(options);

// execute pre-check routine
bot.run(options.dataFile);