import { NFLStatService } from './statService'
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    NFLSchema,
    PassTable,
    PlayerGSIS,
    PlayerTable,
    RecTable,
    RushTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import type { 
    GameData,
} from '../../interfaces/nfl/nflStats';

import type { 
    RawWeeklyStatData,
    PassData,
    RushData,
    RecData
} from '../../interfaces/nfl/nflWeeklyStats';

export class NFLWeeklyStatService extends NFLStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_stats.columns;
        this.urls = this.config.nfl.player_weekly_stats.urls;
    }
    
    public override parseGameData(data: RawWeeklyStatData): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
            opponent: data.opponent,
            fantasy_points: data.fantasy_points,
            fantasy_points_ppr: data.fantasy_points_ppr,
        };
    }

    public parsePassData(data: RawWeeklyStatData): PassData {
        return {
            player_weekly_id: 0,
            attempts: data.attempts,
            completions: data.completions,
            pass_yards: (data.pass_yards) ? data.pass_yards : 0,
            pass_yards_after_catch: (data.pass_yards_after_catch) ? data.pass_yards_after_catch : 0,
            pass_air_yards: (data.pass_air_yards) ? data.pass_air_yards : 0,
            pass_air_conversion_ratio: (data.pass_air_conversion_ratio) ? data.pass_air_conversion_ratio : 0,
            pass_first_downs: data.pass_first_downs,
            dakota: (data.dakota) ? data.dakota : 0,
            pass_epa: (data.pass_epa) ? data.pass_epa : 0,
            pass_tds: data.pass_tds,
            pass_two_pt_conversions: data.pass_two_pt_conversions,
            interceptions: data.interceptions,
            sacks: (data.sacks) ? data.sacks : 0,
            sack_yards: (data.sack_yards) ? data.sack_yards : 0,
            sack_fumbles: data.sack_fumbles,
            sack_fumbles_lost: data.sack_fumbles_lost,
        };
    }

    public parseRushData(data: RawWeeklyStatData): RushData {
        return {
            player_weekly_id: 0,
            carries: data.carries,
            rush_yards: (data.rush_yards) ? data.rush_yards : 0,
            rush_first_downs: data.rush_first_downs,
            rush_epa: (data.rush_epa) ? data.rush_epa : 0,
            rush_tds: data.rush_tds,
            rush_two_pt_conversions: data.rush_two_pt_conversions,
            rush_fumbles: data.rush_fumbles,
            rush_fumbles_lost: data.rush_fumbles_lost,
            special_teams_tds: data.special_teams_tds,
        };
    }

    public parseRecData(data: RawWeeklyStatData): RecData {
        return {
            player_weekly_id: 0,
            targets: data.targets,
            receptions: data.receptions,
            target_share: (data.target_share) ? data.target_share : 0,
            rec_yards: (data.rec_yards) ? data.rec_yards : 0,
            rec_yards_after_catch: (data.rec_yards_after_catch) ? data.rec_yards_after_catch : 0,
            rec_air_yards: (data.rec_air_yards) ? data.rec_air_yards : 0,
            rec_air_yards_share: (data.rec_air_yards_share) ? data.rec_air_yards_share : 0,
            rec_air_conversion_ratio: (data.rec_air_conversion_ratio) ? data.rec_air_conversion_ratio : 0,
            weighted_opportunity_rating: (data.weighted_opportunity_rating) ? data.weighted_opportunity_rating : 0,
            rec_epa: (data.rec_epa) ? data.rec_epa : 0,
            rec_tds: data.rec_tds,
            rec_two_pt_conversions: data.rec_two_pt_conversions,
            rec_first_downs: data.rec_first_downs,
            rec_fumbles: data.rec_fumbles,
            rec_fumbles_lost: data.rec_fumbles_lost,
        };
    }

    public async processPassRecord(week_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, PassTable, WeeklyStatId, week_id, this.parsePassData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processRushRecord(week_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, RushTable, WeeklyStatId, week_id, this.parseRushData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processRecRecord(week_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, RecTable, WeeklyStatId, week_id, this.parseRecData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyStatData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];

            const playerData = this.parsePlayerData(row);
            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`, LogContext.NFLWeeklyStatService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, playerData);
                promises.push(this.processBioRecord(player_id, row));
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processPassRecord(weeklyStatId, row));
            promises.push(this.processRushRecord(weeklyStatId, row));
            promises.push(this.processRecRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Stat Service started...', LogContext.NFLWeeklyStatService);
            await super.runService<RawWeeklyStatData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Stat Service did not complete', error.message, LogContext.NFLWeeklyStatService);
        }
    }
}