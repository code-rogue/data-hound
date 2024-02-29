import { NFLWeeklyStatService } from '../weeklyStats/weeklyStatService'
import { LogContext } from '../../../log/log.enums';

import {
    NFLSchema,    
    WeeklyPassTable as PassTable,
    WeeklyRecTable as RecTable,
    WeeklyRushTable as RushTable,
    WeeklyStatId,
} from '../../../constants/nfl/service.constants'
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { GameData } from '../../../interfaces/nfl/stats';
import type { 
    RawWeeklyStatData,
    PassData,
    RushData,
    RecData
} from '../../../interfaces/nfl/weeklyStats/weeklyStats';

export class NFLWeeklyStatOffService extends NFLWeeklyStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_stats.columns;
        this.logContext = LogContext.NFLWeeklyStatOffService;
        this.serviceName = ServiceName.NFLWeeklyStatOffService;
        this.urls = this.config.nfl.player_weekly_stats.urls;
    }
    
    public override parseGameData(data: RawWeeklyStatData): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
            opponent: data.opponent,
            fantasy_points: parseNumber(data.fantasy_points),
            fantasy_points_ppr: parseNumber(data.fantasy_points_ppr),
        };
    }

    public parsePassData(data: RawWeeklyStatData): PassData {
        return {
            player_weekly_id: 0,
            attempts: parseNumber(data.attempts),
            completions: parseNumber(data.completions),
            pass_yards: parseNumber(data.pass_yards),
            pass_yards_after_catch: parseNumber(data.pass_yards_after_catch),
            pass_air_yards: parseNumber(data.pass_air_yards),
            pass_air_conversion_ratio: parseNumber(data.pass_air_conversion_ratio),
            pass_first_downs: parseNumber(data.pass_first_downs),
            dakota: parseNumber(data.dakota),
            pass_epa: parseNumber(data.pass_epa),
            pass_tds: parseNumber(data.pass_tds),
            pass_two_pt_conversions: parseNumber(data.pass_two_pt_conversions),
            interceptions: parseNumber(data.interceptions),
            sacks: parseNumber(data.sacks),
            sack_yards: parseNumber(data.sack_yards),
            sack_fumbles: parseNumber(data.sack_fumbles),
            sack_fumbles_lost: parseNumber(data.sack_fumbles_lost),
        };
    }

    public parseRushData(data: RawWeeklyStatData): RushData {
        return {
            player_weekly_id: 0,
            carries: parseNumber(data.carries),
            rush_yards: parseNumber(data.rush_yards),
            rush_first_downs: parseNumber(data.rush_first_downs),
            rush_epa: parseNumber(data.rush_epa),
            rush_tds: parseNumber(data.rush_tds),
            rush_two_pt_conversions: parseNumber(data.rush_two_pt_conversions),
            rush_fumbles: parseNumber(data.rush_fumbles),
            rush_fumbles_lost: parseNumber(data.rush_fumbles_lost),
            special_teams_tds: parseNumber(data.special_teams_tds),
        };
    }

    public parseRecData(data: RawWeeklyStatData): RecData {
        return {
            player_weekly_id: 0,
            targets: parseNumber(data.targets),
            receptions: parseNumber(data.receptions),
            target_share: parseNumber(data.target_share),
            rec_yards: parseNumber(data.rec_yards),
            rec_yards_after_catch: parseNumber(data.rec_yards_after_catch),
            rec_air_yards: parseNumber(data.rec_air_yards),
            rec_air_yards_share: parseNumber(data.rec_air_yards_share),
            rec_air_conversion_ratio: parseNumber(data.rec_air_conversion_ratio),
            weighted_opportunity_rating: parseNumber(data.weighted_opportunity_rating),
            rec_epa: parseNumber(data.rec_epa),
            rec_tds: parseNumber(data.rec_tds),
            rec_two_pt_conversions: parseNumber(data.rec_two_pt_conversions),
            rec_first_downs: parseNumber(data.rec_first_downs),
            rec_fumbles: parseNumber(data.rec_fumbles),
            rec_fumbles_lost: parseNumber(data.rec_fumbles_lost),
        };
    }

    public async processStatRecord<T extends RawWeeklyStatData>(week_id: number, row: T): Promise<void> {
        try {
            await this.processRecord(NFLSchema, PassTable, WeeklyStatId, week_id, this.parsePassData(row));
            await this.processRecord(NFLSchema, RushTable, WeeklyStatId, week_id, this.parseRushData(row));
            await this.processRecord(NFLSchema, RecTable, WeeklyStatId, week_id, this.parseRecData(row));
        } catch(error: any) {
            throw error;
        }
    }
}