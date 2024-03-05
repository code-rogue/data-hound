import * as cron from 'node-cron';

import { logger } from '@log/logger'
import { LogContext } from '@log/log.enums';

import { NFLPlayerService } from '@data-services/nfl/playerService';
import { NFLWeeklyStatOffService } from '@data-services/nfl/weeklyStats/weeklyStatOffService';
import { NFLWeeklyStatDefService } from '@data-services/nfl/weeklyStats/weeklyStatDefService';
import { NFLWeeklyStatKickService } from '@data-services/nfl/weeklyStats/weeklyStatKickService';
import { NFLWeeklyAdvStatPassService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatPassService';
import { NFLWeeklyAdvStatRecService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatRecService';
import { NFLWeeklyAdvStatRushService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatRushService';
import { NFLWeeklyAdvStatDefService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatDefService';
import { NFLWeeklyNextGenStatPassService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatPassService';
import { NFLWeeklyNextGenStatRecService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatRecService';
import { NFLWeeklyNextGenStatRushService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatRushService';
import { NFLSeasonAdvStatDefService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatDefService';
import { NFLSeasonAdvStatPassService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatPassService';
import { NFLSeasonAdvStatRecService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatRecService';
import { NFLSeasonAdvStatRushService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatRushService';

async function runService(): Promise<void> {
  try {
    const players = new NFLPlayerService();
    const weeklyOffStats = new NFLWeeklyStatOffService();
    const weeklyDefStats = new NFLWeeklyStatDefService();
    const weeklyKickStats = new NFLWeeklyStatKickService();
    const weeklyAdvPassStats = new NFLWeeklyAdvStatPassService();
    const weeklyAdvRecStats = new NFLWeeklyAdvStatRecService();
    const weeklyAdvRushStats = new NFLWeeklyAdvStatRushService();
    const weeklyAdvDefStats = new NFLWeeklyAdvStatDefService();
    const weeklyNextGenPassStats = new NFLWeeklyNextGenStatPassService();
    const weeklyNextGenRecStats = new NFLWeeklyNextGenStatRecService();
    const weeklyNextGenRushStats = new NFLWeeklyNextGenStatRushService();
    const seasonAdvDefStats = new NFLSeasonAdvStatDefService();
    const seasonAdvPassStats = new NFLSeasonAdvStatPassService();
    const seasonAdvRecStats = new NFLSeasonAdvStatRecService();
    const seasonAdvRushStats = new NFLSeasonAdvStatRushService();
        
    //await players.runService();
    //await weeklyOffStats.runService();
    //await weeklyDefStats.runService();
    //await weeklyKickStats.runService();
    //await weeklyAdvPassStats.runService();
    //await weeklyAdvRecStats.runService();
    //await weeklyAdvRushStats.runService();
    //await weeklyAdvDefStats.runService();
    //await seasonAdvPassStats.runService();
    //await seasonAdvRecStats.runService();
    //await seasonAdvRushStats.runService();
    //await seasonAdvDefStats.runService();
    await weeklyNextGenPassStats.runService();
    await weeklyNextGenRecStats.runService();
    await weeklyNextGenRushStats.runService();
    logger.debug(`Completed processing services.`, LogContext.Service);
  }
  catch(error: any) {
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