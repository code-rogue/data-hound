import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    ServiceName,
    WeeklyNextGenRecTable,
    WeeklyStatId,
    SeasonNextGenRecTable,
    SeasonStatId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyNextGenStatService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatService';
import { parseNumber } from '@utils/utils';
import { RawWeeklyStatData } from '@interfaces/nfl/stats';

import type { 
    RawWeeklyNextGenStatRecData,
    NextGenRecData
} from '@interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsRec';

export class NFLWeeklyNextGenStatRecService extends NFLWeeklyNextGenStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_nextgen_rec_stats.columns;
        this.logContext = LogContext.NFLWeeklyNextGenStatRecService;
        this.serviceName = ServiceName.NFLWeeklyNextGenStatRecService;
        this.urls = this.config.nfl.player_weekly_nextgen_rec_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyNextGenStatRecData): NextGenRecData {
        return {
            avg_cushion: parseNumber(data.avg_cushion),
            avg_separation: parseNumber(data.avg_separation),
            avg_intended_air_yards: parseNumber(data.avg_intended_air_yards),
            catch_pct: parseNumber(data.catch_pct),
            share_of_intended_air_yards_pct: parseNumber(data.share_of_intended_air_yards_pct),
            avg_yac: parseNumber(data.avg_yac),
            avg_expected_yac: parseNumber(data.avg_expected_yac),
            avg_yac_above_expectation: parseNumber(data.avg_yac_above_expectation),
        };
    }

    public override async processStatRecord<T extends RawWeeklyStatData>(week_id: number, row: T): Promise<void> {
        try {
            await this.processRecord(
                NFLSchema, 
                WeeklyNextGenRecTable, 
                WeeklyStatId, 
                week_id, 
                this.parseStatData(row as unknown as RawWeeklyNextGenStatRecData)
            );
        } catch(error: any) {
            throw error;
        }
    }

    public override async processSeasonStatRecord<T extends RawWeeklyStatData>(season_id: number, row: T): Promise<void> {
        try {
            await this.processRecord(
                NFLSchema, 
                SeasonNextGenRecTable, 
                SeasonStatId, 
                season_id, 
                this.parseStatData(row as unknown as RawWeeklyNextGenStatRecData)
            );
        } catch(error: any) {
            throw error;
        }
    }
}