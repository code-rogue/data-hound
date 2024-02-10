import * as winston from 'winston';

import {
  consoleTransport,
  errorFileTransport,
  logFileTransport,   
} from './log.constants'

class Log {
    public logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            defaultMeta: {
                service: 'data-hound',
            },
            level: 'debug',
            levels: winston.config.syslog.levels,
            transports: [
                consoleTransport,
                logFileTransport,
                errorFileTransport,
            ],
        });
    }
    debug(message: string, context: string) {
        this.logger.debug(message, { context });
    }
    log(message: string, context: string) {
        this.logger.info(message, { context } );
    }
    notice(message: string, context: string) {
        this.logger.notice(message, { context });
    }
    warn(message: string, context: string) {
        this.logger.warning(message, { context });
    }
    error(message: string, trace: string, context: string) {
        this.logger.error(message, { trace, context });
    }
    crit(message: string, context: string) {
        this.logger.crit(message, { context });
    }
    emerg(message: string, context: string) {
        this.logger.emerg(message, { context });
    }
}

export const logger = new Log();