import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    ServiceName,
    WeeklyAdvRushTable,
    WeeklyStatId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyAdvStatService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatService';
import { parseNumber } from '@utils/utils';

import type { 
    RawWeeklyAdvStatRushData,
    AdvRushData
} from '@interfaces/nfl/weeklyAdvStats/weeklyAdvStatsRush';

export class NFLWeeklyAdvStatRushService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_rush_stats.columns;
        this.logContext = LogContext.NFLWeeklyAdvStatRushService;
        this.serviceName = ServiceName.NFLWeeklyAdvStatRushService;
        this.urls = this.config.nfl.player_weekly_adv_rush_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyAdvStatRushData): AdvRushData {
        return {
            player_weekly_id: 0,
            yards_before_contact: parseNumber(data.yards_before_contact),
            yards_before_contact_avg: parseNumber(data.yards_before_contact_avg),
            yards_after_contact: parseNumber(data.yards_after_contact),
            yards_after_contact_avg: parseNumber(data.yards_after_contact_avg),
            broken_tackles: parseNumber(data.broken_tackles),
        };
    }

    public async processStatRecord(week_id: number, row: RawWeeklyAdvStatRushData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyAdvRushTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}