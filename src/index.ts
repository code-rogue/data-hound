import * as cron from 'node-cron';

import { logger } from './log/logger'
import { LogContext } from './log/log.enums';

import { NFLPlayerService } from './data-services/nfl/playerService';
import { NFLWeeklyStatService } from './data-services/nfl/weeklyStatService';
import { NFLWeeklyStatDefService } from './data-services/nfl/weeklyStatDefService';
import { NFLWeeklyStatKickService } from './data-services/nfl/weeklyStatKickService';
import { NFLWeeklyAdvStatPassService } from './data-services/nfl/weeklyAdvStatPassService';
import { NFLWeeklyAdvStatRecService } from './data-services/nfl/weeklyAdvStatRecService';
import { NFLWeeklyAdvStatRushService } from './data-services/nfl/weeklyAdvStatRushService';
import { NFLWeeklyAdvStatDefService } from './data-services/nfl/weeklyAdvStatDefService';

async function runService(): Promise<void> {
  const players = new NFLPlayerService();
  const weeklyStats = new NFLWeeklyStatService();
  const weeklyDefStats = new NFLWeeklyStatDefService();
  const weeklyKickStats = new NFLWeeklyStatKickService();
  const weeklyAdvPassStats = new NFLWeeklyAdvStatPassService();
  const weeklyAdvRecStats = new NFLWeeklyAdvStatRecService();
  const weeklyAdvRushStats = new NFLWeeklyAdvStatRushService();
  const weeklyAdvDefStats = new NFLWeeklyAdvStatDefService();
  //await players.runService();

  const promises: Promise<void>[] = [];
  promises.push(weeklyStats.runService());
  promises.push(weeklyDefStats.runService());
  promises.push(weeklyKickStats.runService());
  promises.push(weeklyAdvPassStats.runService());
  promises.push(weeklyAdvRecStats.runService());
  promises.push(weeklyAdvRushStats.runService());
  promises.push(weeklyAdvDefStats.runService());
    
  Promise.all(promises)
  .catch((error) => {
    console.log('Error: ', error);
    logger.error('Error: ', error.message, LogContext.Service);
  })
  .finally(() => {
      logger.debug(`Completed processing services.`, LogContext.Service);
  });
}

const schedule = '0 0 * * *'; // Run daily at midnight

if (process.argv[2] === 'schedule') {
  cron.schedule(schedule, runService);
  logger.log(`Scheduled service to run at: ${schedule}`, LogContext.Service);
} else {
  // Run service immediately
  runService();
}