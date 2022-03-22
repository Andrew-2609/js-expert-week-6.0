import config from './config.js';
import server from './server.js';
import { logger } from './util.js';

server.listen(config.port).on('listening', () => { logger.info(`Server running at port ${config.port}`) });

// prevent the application from crashing in case an uncaught/unhandled exception occurs
// uncaught => Errors
// unhandled => Promises
process.on('uncaughtException', (error) => logger.error(`An uncaught exception was thrown: ${error.stack || error}`));
process.on('unhandledRejection', (error) => logger.error(`An unhandled exception was thrown: ${error.stack || error}`));