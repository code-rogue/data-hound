import { LogContext } from '../../../log/log.enums';

import {
    NFLSchema,
    WeeklyDefTable,
    WeeklyStatId,
} from '../../../constants/nfl/service.constants'
import { NFLWeeklyStatService } from '../weeklyStats/weeklyStatService';
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    DefData,
    RawWeeklyStatDefData,
} from '../../../interfaces/nfl/weeklyStats/weeklyStatsDef';

export class NFLWeeklyStatDefService extends NFLWeeklyStatService {
    constructor() {
        super();
        this.columns = this.config.nfl.player_weekly_def_stats.columns;
        this.logContext = LogContext.NFLWeeklyStatDefService;
        this.serviceName = ServiceName.NFLWeeklyStatDefService;
        this.urls = this.config.nfl.player_weekly_def_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyStatDefData): DefData {
        return {
            player_weekly_id: 0,
            tackles: parseNumber(data.tackles),
            tackles_solo: parseNumber(data.tackles_solo),
            tackle_with_assists: parseNumber(data.tackle_with_assists),
            tackle_assists: parseNumber(data.tackle_assists),
            tackles_for_loss: parseNumber(data.tackles_for_loss),
            tackles_for_loss_yards: parseNumber(data.tackles_for_loss_yards),
            fumbles_forced: parseNumber(data.fumbles_forced),
            sacks: parseNumber(data.sacks),
            sack_yards: parseNumber(data.sack_yards),
            qb_hits: parseNumber(data.qb_hits),
            interceptions: parseNumber(data.interceptions),
            interception_yards: parseNumber(data.interception_yards),
            pass_defended: parseNumber(data.pass_defended),
            tds: parseNumber(data.tds),
            fumbles: parseNumber(data.fumbles),
            fumble_recovery_own: parseNumber(data.fumble_recovery_own),
            fumble_recovery_yards_own: parseNumber(data.fumble_recovery_yards_own),
            fumble_recovery_opp: parseNumber(data.fumble_recovery_opp),
            fumble_recovery_yards_opp: parseNumber(data.fumble_recovery_yards_opp),
            safety: parseNumber(data.safety),
            penalty: parseNumber(data.penalty),
            penalty_yards: parseNumber(data.penalty_yards),
        };
    }

    public async processStatRecord(week_id: number, row: RawWeeklyStatDefData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyDefTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}











