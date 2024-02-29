import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    WeeklyKickTable,
    WeeklyStatId,    
} from '../../../constants/nfl/service.constants';
import { NFLWeeklyStatService } from '../weeklyStats/weeklyStatService';
import { parseNumber, splitString } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    BioData,
    GameData,
    LeagueData,
    PlayerData,
} from '../../../interfaces/nfl/stats';

import type { 
    RawWeeklyStatKickData,
    WeeklyKickData
} from '../../../interfaces/nfl/weeklyStats/weeklyStatsKick';

export class NFLWeeklyStatKickService extends NFLWeeklyStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_kick_stats.columns;
        this.logContext = LogContext.NFLWeeklyStatKickService;
        this.serviceName = ServiceName.NFLWeeklyStatKickService;
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

    public parseStatData(data: RawWeeklyStatKickData): WeeklyKickData {
        return {
            player_weekly_id: 0,
            fg_made: parseNumber(data.fg_made),
            fg_missed: parseNumber(data.fg_missed),
            fg_blocked: parseNumber(data.fg_blocked),
            fg_long: parseNumber(data.fg_long),
            fg_att: parseNumber(data.fg_att),
            fg_pct: parseNumber(data.fg_pct),
            pat_made: parseNumber(data.pat_made),
            pat_missed: parseNumber(data.pat_missed),
            pat_blocked: parseNumber(data.pat_blocked),
            pat_att: parseNumber(data.pat_att),
            pat_pct: parseNumber(data.pat_pct),
            fg_made_distance: parseNumber(data.fg_made_distance),
            fg_missed_distance: parseNumber(data.fg_missed_distance),
            fg_blocked_distance: parseNumber(data.fg_blocked_distance),
            gwfg_att: parseNumber(data.gwfg_att),
            gwfg_distance: parseNumber(data.gwfg_distance),
            gwfg_made: parseNumber(data.gwfg_made),
            gwfg_missed: parseNumber(data.gwfg_missed),
            gwfg_blocked: parseNumber(data.gwfg_blocked),
            fg_made_0_19: parseNumber(data.fg_made_0_19),
            fg_made_20_29: parseNumber(data.fg_made_20_29),
            fg_made_30_39: parseNumber(data.fg_made_30_39),
            fg_made_40_49: parseNumber(data.fg_made_40_49),
            fg_made_50_59: parseNumber(data.fg_made_50_59),
            fg_made_60_: parseNumber(data.fg_made_60_),
            fg_missed_0_19: parseNumber(data.fg_missed_0_19),
            fg_missed_20_29: parseNumber(data.fg_missed_20_29),
            fg_missed_30_39: parseNumber(data.fg_missed_30_39),
            fg_missed_40_49: parseNumber(data.fg_missed_40_49),
            fg_missed_50_59: parseNumber(data.fg_missed_50_59),
            fg_missed_60_: parseNumber(data.fg_missed_60_),
            fg_made_list: data.fg_made_list,
            fg_missed_list: data.fg_missed_list,
            fg_blocked_list: data.fg_blocked_list,
        };
    }

    public async processStatRecord(week_id: number, row: RawWeeklyStatKickData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyKickTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}