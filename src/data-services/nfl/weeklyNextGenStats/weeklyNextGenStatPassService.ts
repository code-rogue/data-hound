import { LogContext } from '@log/log.enums';
import {
    CalcSeasonNextGenPassStats,
    NFLSchema,
    SeasonNextGenPassTable,
    SeasonStatId,
    ServiceName,
    WeeklyNextGenPassTable,
    WeeklyStatId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyNextGenStatService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatService';
import { parseNumber } from '@utils/utils';
import { RawWeeklyStatData } from '@interfaces/nfl/stats';

import type { 
    RawWeeklyNextGenStatPassData,
    NextGenPassData
} from '@interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsPass';

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

    public async processProcedures(): Promise<void> {
        await this.callProcedure(NFLSchema, CalcSeasonNextGenPassStats);
    }

    public override async processStatRecord<T extends RawWeeklyStatData>(week_id: number, row: T): Promise<void> {
        try {
            await this.processRecord(
                NFLSchema, 
                WeeklyNextGenPassTable, 
                WeeklyStatId, 
                week_id, 
                this.parseStatData(row as unknown as RawWeeklyNextGenStatPassData)
            );
        } catch(error: any) {
            throw error;
        }
    }

    public override async processSeasonStatRecord<T extends RawWeeklyStatData>(season_id: number, row: T): Promise<void> {
        try {
            await this.processRecord(
                NFLSchema, 
                SeasonNextGenPassTable, 
                SeasonStatId, 
                season_id, 
                this.parseStatData(row as unknown as RawWeeklyNextGenStatPassData)
            );
        } catch(error: any) {
            throw error;
        }
    }
}