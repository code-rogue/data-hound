import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    SeasonAdvRecTable,
    SeasonStatId,
} from '../../../constants/nfl/service.constants'
import { NFLSeasonAdvStatService } from './seasonAdvStatService'
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawSeasonAdvStatRecData,
    SeasonAdvStatRecData
} from '../../../interfaces/nfl/seasonAdvStats/seasonAdvStatsRec';

export class NFLSeasonAdvStatRecService extends NFLSeasonAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_season_adv_rec_stats.columns;
        this.logContext = LogContext.NFLSeasonAdvStatRecService;
        this.serviceName = ServiceName.NFLSeasonAdvStatRecService;
        this.urls = this.config.nfl.player_season_adv_rec_stats.urls;
    }
    
    public parseStatData(data: RawSeasonAdvStatRecData): SeasonAdvStatRecData {
        return {
            player_season_id: 0,
            targets: parseNumber(data.targets),
            receptions: parseNumber(data.receptions),
            yards: parseNumber(data.yards),
            tds: parseNumber(data.tds),
            longest_rec: parseNumber(data.longest_rec),
            air_yards: parseNumber(data.air_yards),
            air_yards_avg: parseNumber(data.air_yards_avg),
            yards_after_contact: parseNumber(data.yards_after_contact),
            yards_after_contact_avg: parseNumber(data.yards_after_contact_avg),
            adot: parseNumber(data.adot),
            broken_tackles: parseNumber(data.broken_tackles),
            broken_tackles_avg: parseNumber(data.broken_tackles_avg),
            drops: parseNumber(data.drops),
            drop_pct: parseNumber(data.drop_pct),
            interceptions: parseNumber(data.interceptions),
            qb_rating: parseNumber(data.qb_rating),
        };
    }

    public async processStatRecord(season_id: number, row: RawSeasonAdvStatRecData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, SeasonAdvRecTable, SeasonStatId, season_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}