import { CommandLineOptions } from '@interfaces/command-line/command-line';
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

export async function runServices(options: CommandLineOptions): Promise<void> {
    try {
      logger.debug(`Running services...`, LogContext.Service);
  
      if(options.players) {
        const players = new NFLPlayerService();
        await players.runService();
      }
  
      if(options.weeklyOffense) {
        const weeklyOffStats = new NFLWeeklyStatOffService();
        await weeklyOffStats.runService();
      }
      
      if(options.weeklyDefense) {
        const weeklyDefStats = new NFLWeeklyStatDefService();
        await weeklyDefStats.runService();
      }
  
      if(options.weeklyKick) {
        const weeklyKickStats = new NFLWeeklyStatKickService();
        await weeklyKickStats.runService();
      }
  
      if(options.weeklyAdvDefense) {
        const weeklyAdvDefStats = new NFLWeeklyAdvStatDefService();
        await weeklyAdvDefStats.runService();
      }
  
      if(options.weeklyAdvPass) {
        const weeklyAdvPassStats = new NFLWeeklyAdvStatPassService();
        await weeklyAdvPassStats.runService();
      }
  
      if(options.weeklyAdvRec) {
        const weeklyAdvRecStats = new NFLWeeklyAdvStatRecService();
        await weeklyAdvRecStats.runService();
      }
  
      if(options.weeklyAdvRush) {
        const weeklyAdvRushStats = new NFLWeeklyAdvStatRushService();
        await weeklyAdvRushStats.runService();
      }
  
      if(options.nextGenPass) {
        const weeklyNextGenPassStats = new NFLWeeklyNextGenStatPassService();
        await weeklyNextGenPassStats.runService();
        
      }
      
      if(options.nextGenRec) {
        const weeklyNextGenRecStats = new NFLWeeklyNextGenStatRecService();
        await weeklyNextGenRecStats.runService();
      }
  
      if(options.nextGenRush) {
        const weeklyNextGenRushStats = new NFLWeeklyNextGenStatRushService();
        await weeklyNextGenRushStats.runService();
      }
  
      if(options.seasonAdvDef) {
        const seasonAdvDefStats = new NFLSeasonAdvStatDefService();
        await seasonAdvDefStats.runService();
      }
  
      if(options.seasonAdvPass) {
        const seasonAdvPassStats = new NFLSeasonAdvStatPassService();
        await seasonAdvPassStats.runService();
      }
  
      if(options.seasonAdvRec) {
        const seasonAdvRecStats = new NFLSeasonAdvStatRecService();
        await seasonAdvRecStats.runService();
      }
      
      if(options.seasonAdvRush) {
        const seasonAdvRushStats = new NFLSeasonAdvStatRushService();
        await seasonAdvRushStats.runService();
      }
      
      logger.debug(`Completed processing services.`, LogContext.Service);
    }
    catch(error: any) {
      console.error('Error: ', error);
      logger.error('Error: ', error.message, LogContext.Service);
    }
  }