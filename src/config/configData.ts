import { Config } from '@interfaces/config/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { logger } from '@log/logger'
import { LogContext } from '@log/log.enums';

export function getConfigurationData(): Config {
    const configPath = resolve(__dirname, './config.json');
    logger.debug(`Loading Config File: ${configPath}`, LogContext.Service);
    const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
    return configData;
}