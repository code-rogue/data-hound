import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    ServiceName,
    WeeklyNextGenRushTable,
    WeeklyStatId,
} from '@constants/nfl/service.constants';
import { 
    NFLWeeklyNextGenStatService 
} from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatService';
import { parseNumber } from '@utils/utils';

import type { 
    RawWeeklyNextGenStatRushData,
    NextGenRushData
} from '@interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsRush';

export class NFLWeeklyNextGenStatRushService extends NFLWeeklyNextGenStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_nextgen_rush_stats.columns;
        this.logContext = LogContext.NFLWeeklyNextGenStatRushService;
        this.serviceName = ServiceName.NFLWeeklyNextGenStatRushService;
        this.urls = this.config.nfl.player_weekly_nextgen_rush_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyNextGenStatRushData): NextGenRushData {
        return {
            player_weekly_id: 0,
            efficiency: parseNumber(data.efficiency),
            attempts_gte_eight_defenders_pct: parseNumber(data.attempts_gte_eight_defenders_pct),
            avg_time_to_los: parseNumber(data.avg_time_to_los),
            expected_yards: parseNumber(data.expected_yards),
            yards_over_expected: parseNumber(data.yards_over_expected),
            avg_yards: parseNumber(data.avg_yards),
            yards_over_expected_per_att: parseNumber(data.yards_over_expected_per_att),
            yards_over_expected_pct: parseNumber(data.yards_over_expected_pct),
        };
    }

    public override async processStatRecord(week_id: number, row: RawWeeklyNextGenStatRushData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyNextGenRushTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }

    
}