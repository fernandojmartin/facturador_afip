process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1);
})

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
})