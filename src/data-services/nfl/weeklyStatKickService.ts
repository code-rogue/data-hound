import { NFLStatService } from './statService'
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    KickTable,
    NFLSchema,
    PlayerGSIS,
    PlayerTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import { splitString } from './utils/utils'

import type { 
    BioData,
    GameData,
    LeagueData,
    PlayerData,
} from '../../interfaces/nfl/stats';

import type { 
    RawWeeklyStatKickData,
    KickData
} from '../../interfaces/nfl/weeklyStatsKick';

export class NFLWeeklyStatKickService extends NFLStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_kick_stats.columns;
        this.urls = this.config.nfl.player_weekly_kick_stats.urls;
    }
    
    // Kick data only has short name 'A.Davis'
    public override parsePlayerData(data: RawWeeklyStatKickData): PlayerData {
        const {firstPart: first_name, secondPart: last_name} = splitString(data.short_name, '.');
        return {
            gsis_id: data.gsis_id,
            first_name,
            last_name,
            full_name: data.short_name ?? '',
            short_name: data.short_name,
        };
    }

    public override parseGameData(data: RawWeeklyStatKickData): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
        };
    }

    public override parseBioData(data: RawWeeklyStatKickData): BioData {
        return {
            player_id: 0,
            headshot_url: '',
        };
    }

    public override parseLeagueData(data: RawWeeklyStatKickData): LeagueData {
        return {
            player_id: 0,
            position: 'K',
            position_group: 'K',
            team: data.team,
        };
    }

    public parseKickData(data: RawWeeklyStatKickData): KickData {
        return {
            player_weekly_id: 0,
            fg_made: data.fg_made,
            fg_missed: data.fg_missed,
            fg_blocked: data.fg_blocked,
            fg_long: data.fg_long,
            fg_att: data.fg_att,
            fg_pct: (data.fg_pct) ? data.fg_pct : 0,
            pat_made: data.pat_made,
            pat_missed: data.pat_missed,
            pat_blocked: data.pat_blocked,
            pat_att: data.pat_att,
            pat_pct: (data.pat_pct) ? data.pat_pct : 0,
            fg_made_distance: data.fg_made_distance,
            fg_missed_distance: data.fg_missed_distance,
            fg_blocked_distance: data.fg_blocked_distance,
            gwfg_att: data.gwfg_att,
            gwfg_distance: data.gwfg_distance,
            gwfg_made: data.gwfg_made,
            gwfg_missed: data.gwfg_missed,
            gwfg_blocked: data.gwfg_blocked,
            fg_made_0_19: data.fg_made_0_19,
            fg_made_20_29: data.fg_made_20_29,
            fg_made_30_39: data.fg_made_30_39,
            fg_made_40_49: data.fg_made_40_49,
            fg_made_50_59: data.fg_made_50_59,
            fg_made_60_: data.fg_made_60_,
            fg_missed_0_19: data.fg_missed_0_19,
            fg_missed_20_29: data.fg_missed_20_29,
            fg_missed_30_39: data.fg_missed_30_39,
            fg_missed_40_49: data.fg_missed_40_49,
            fg_missed_50_59: data.fg_missed_50_59,
            fg_missed_60_: data.fg_missed_60_,
            fg_made_list: data.fg_made_list,
            fg_missed_list: data.fg_missed_list,
            fg_blocked_list: data.fg_blocked_list,
        };
    }

    public async processKickRecord(week_id: number, row: RawWeeklyStatKickData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, KickTable, WeeklyStatId, week_id, this.parseKickData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyStatKickData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];

            const playerData = this.parsePlayerData(row);
            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`, LogContext.NFLWeeklyStatKickService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, playerData);
                promises.push(this.processBioRecord(player_id, row));
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processKickRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatKickService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Kick Stat Service started...', LogContext.NFLWeeklyStatKickService);
            await super.runService<RawWeeklyStatKickData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Kick Stat Service did not complete', error.message, LogContext.NFLWeeklyStatKickService);
        }
    }
}