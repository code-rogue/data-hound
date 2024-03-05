import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    ServiceName,
    WeeklyAdvRecTable,
    WeeklyStatId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyAdvStatService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatService';
import { parseNumber } from '@utils/utils';

import type { 
    RawWeeklyAdvStatRecData,
    AdvRecData
} from '@interfaces/nfl/weeklyAdvStats/weeklyAdvStatsRec';

export class NFLWeeklyAdvStatRecService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_rec_stats.columns;
        this.logContext = LogContext.NFLWeeklyAdvStatRecService;
        this.serviceName = ServiceName.NFLWeeklyAdvStatRecService;
        this.urls = this.config.nfl.player_weekly_adv_rec_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyAdvStatRecData): AdvRecData {
        return {
            player_weekly_id: 0,
            broken_tackles: parseNumber(data.broken_tackles),
            drops: parseNumber(data.drops),
            drop_pct: parseNumber(data.drop_pct),
            interceptions: parseNumber(data.interceptions),
            qb_rating: parseNumber(data.qb_rating),
        };
    }

    public async processStatRecord(week_id: number, row: RawWeeklyAdvStatRecData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyAdvRecTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}