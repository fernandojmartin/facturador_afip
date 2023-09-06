import chalk from 'chalk';

export default class Logger {
    log(data) {
        console.log(typeof data === "string" ? data : {...data});
    }

    phase(message) {
        console.log(chalk.green(`\n### ${message} ###`));
    }

    step(message) {
        console.log(chalk.cyan(` >  ${message}`));
    }

    substep(message) {
        console.log(chalk.white(`  ~  ${message}`));
    }
}