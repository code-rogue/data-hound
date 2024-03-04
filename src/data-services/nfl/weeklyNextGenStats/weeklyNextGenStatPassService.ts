import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    WeeklyNextGenPassTable,
    WeeklyStatId,
} from '../../../constants/nfl/service.constants'
import { NFLWeeklyNextGenStatService } from '../weeklyNextGenStats/weeklyNextGenStatService';
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawWeeklyNextGenStatPassData,
    NextGenPassData
} from '../../../interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsPass';

export class NFLWeeklyNextGenStatPassService extends NFLWeeklyNextGenStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_nextgen_pass_stats.columns;
        this.logContext = LogContext.NFLWeeklyNextGenStatPassService;
        this.serviceName = ServiceName.NFLWeeklyNextGenStatPassService;
        this.urls = this.config.nfl.player_weekly_nextgen_pass_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyNextGenStatPassData): NextGenPassData {
        return {
            player_weekly_id: 0,
            aggressiveness: parseNumber(data.aggressiveness),
            avg_time_to_throw: parseNumber(data.avg_time_to_throw),
            avg_air_distance: parseNumber(data.avg_air_distance),
            max_air_distance: parseNumber(data.max_air_distance),
            avg_completed_air_yards: parseNumber(data.avg_completed_air_yards),
            avg_intended_air_yards: parseNumber(data.avg_intended_air_yards),
            avg_air_yards_differential: parseNumber(data.avg_air_yards_differential),
            avg_air_yards_to_sticks: parseNumber(data.avg_air_yards_to_sticks),
            max_completed_air_distance: parseNumber(data.max_completed_air_distance),
            passer_rating: parseNumber(data.passer_rating),
            completion_pct: parseNumber(data.completion_pct),
            expected_completion_pct: parseNumber(data.expected_completion_pct),
            completions_above_expectation_pct: parseNumber(data.completions_above_expectation_pct),
        };
    }

    public override async processStatRecord(week_id: number, row: RawWeeklyNextGenStatPassData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyNextGenPassTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }

    
}