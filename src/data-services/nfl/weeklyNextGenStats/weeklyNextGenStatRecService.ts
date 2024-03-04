import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    WeeklyNextGenRecTable,
    WeeklyStatId,
} from '../../../constants/nfl/service.constants'
import { NFLWeeklyNextGenStatService } from '../weeklyNextGenStats/weeklyNextGenStatService';
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawWeeklyNextGenStatRecData,
    NextGenRecData
} from '../../../interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsRec';

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
            player_weekly_id: 0,
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

    public override async processStatRecord(week_id: number, row: RawWeeklyNextGenStatRecData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyNextGenRecTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }

    
}