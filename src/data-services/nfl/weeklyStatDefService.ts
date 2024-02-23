import { NFLStatService } from './statService'
import { downloadCSV, parseCSV } from '../../csv/csvService';
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    DefTable,
    NFLSchema,
    PassTable,
    PlayerGSIS,
    PlayerTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import type { 
    DefData,
    RawWeeklyStatDefData,
} from '../../interfaces/nfl/weeklyStatsDef';

import { splitString } from './utils/utils'
 
export class NFLWeeklyStatDefService extends NFLStatService {
    constructor() {
        super();
        this.columns = this.config.nfl.player_weekly_def_stats.columns;
        this.urls = this.config.nfl.player_weekly_def_stats.urls;
    }
    
    public parseDefData(data: RawWeeklyStatDefData): DefData {
        return {
            player_weekly_id: 0,
            tackles: data.tackles,
            tackles_solo: data.tackles_solo,
            tackle_with_assists: data.tackle_with_assists,
            tackle_assists: data.tackle_assists,
            tackles_for_loss: data.tackles_for_loss,
            tackles_for_loss_yards: data.tackles_for_loss_yards,
            fumbles_forced: data.fumbles_forced,
            sacks: data.sacks,
            sack_yards: data.sack_yards,
            qb_hits: data.qb_hits,
            interceptions: data.interceptions,
            interception_yards: data.interception_yards,
            pass_defended: data.pass_defended,
            tds: data.tds,
            fumbles: data.fumbles,
            fumble_recovery_own: data.fumble_recovery_own,
            fumble_recovery_yards_own: data.fumble_recovery_yards_own,
            fumble_recovery_opp: data.fumble_recovery_opp,
            fumble_recovery_yards_opp: data.fumble_recovery_yards_opp,
            safety: data.safety,
            penalty: data.penalty,
            penalty_yards: data.penalty_yards,
        };
    }

    public async processDefRecord(week_id: number, row: RawWeeklyStatDefData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, DefTable, WeeklyStatId, week_id, this.parseDefData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyStatDefData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];

            const playerData = this.parsePlayerData(row);
            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`, LogContext.NFLWeeklyStatDefService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, playerData);
                promises.push(this.processBioRecord(player_id, row));
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processDefRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatDefService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Def Stat Service started...', LogContext.NFLWeeklyStatDefService);
            await super.runService<RawWeeklyStatDefData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Def Stat Service did not complete', error.message, LogContext.NFLWeeklyStatDefService);
        }
    }
}











