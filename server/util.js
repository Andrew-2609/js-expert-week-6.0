import pino from 'pino';

const log = pino({
    enabled: !(!!process.env.LOG_DISABLED),
    transport: 'pino-pretty',
    options: {
        colorize: true
    }
});

export const logger = log;