import * as cron from 'node-cron';

import { logger } from './log/logger'
import { LogContext } from './log/log.enums';

import { NFLPlayerService } from './data-services/nfl/playerService';

async function runService(): Promise<void> {
  try {
    const players = new NFLPlayerService();
    await players.runService();
  } catch (error: any) {
    console.log('Error: ', error);
    logger.error('Error: ', error.message, LogContext.Service);
  }
}

const schedule = '0 0 * * *'; // Run daily at midnight

if (process.argv[2] === 'schedule') {
  cron.schedule(schedule, runService);
  logger.log(`Scheduled service to run at: ${schedule}`, LogContext.Service);
} else {
  // Run service immediately
  runService();
}