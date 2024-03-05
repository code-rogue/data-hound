import { NFLSeasonAdvStatService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatService';
import { LogContext } from '@log/log.enums';

import {
    NFLSchema,
    SeasonAdvRushTable,
    ServiceName,
    SeasonStatId,    
} from '@constants/nfl/service.constants';
import { parseNumber } from '@utils/utils';

import type { 
    RawSeasonAdvStatRushData,
    SeasonAdvStatRushData
} from '@interfaces/nfl/seasonAdvStats/seasonAdvStatsRush';

export class NFLSeasonAdvStatRushService extends NFLSeasonAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_season_adv_rush_stats.columns;
        this.logContext = LogContext.NFLSeasonAdvStatRushService;
        this.serviceName = ServiceName.NFLSeasonAdvStatRushService;
        this.urls = this.config.nfl.player_season_adv_rush_stats.urls;
    }
    
    public parseStatData(data: RawSeasonAdvStatRushData): SeasonAdvStatRushData {
        return {
            player_season_id: 0,
            attempts: parseNumber(data.attempts),
            yards: parseNumber(data.yards),
            tds: parseNumber(data.tds),
            longest_rush: parseNumber(data.longest_rush),
            yards_before_contact: parseNumber(data.yards_before_contact),
            yards_before_contact_avg: parseNumber(data.yards_before_contact_avg),
            yards_after_contact: parseNumber(data.yards_after_contact),
            yards_after_contact_avg: parseNumber(data.yards_after_contact_avg),
            broken_tackles: parseNumber(data.broken_tackles),
            broken_tackles_avg: parseNumber(data.broken_tackles_avg),
        };
    }

    public async processStatRecord(season_id: number, row: RawSeasonAdvStatRushData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, SeasonAdvRushTable, SeasonStatId, season_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}