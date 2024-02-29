import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    SeasonAdvDefTable,
    SeasonStatId,
} from '../../../constants/nfl/service.constants'
import { NFLSeasonAdvStatService } from './seasonAdvStatService'
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawSeasonAdvStatDefData,
    SeasonAdvStatDefData
} from '../../../interfaces/nfl/seasonAdvStats/seasonAdvStatsDef';

export class NFLSeasonAdvStatDefService extends NFLSeasonAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_season_adv_def_stats.columns;
        this.logContext = LogContext.NFLSeasonAdvStatDefService;
        this.serviceName = ServiceName.NFLSeasonAdvStatDefService;
        this.urls = this.config.nfl.player_season_adv_def_stats.urls;
    }
    
    public parseStatData(data: RawSeasonAdvStatDefData): SeasonAdvStatDefData {
        return {
            player_season_id: 0,
            interceptions: parseNumber(data.interceptions),
            targets: parseNumber(data.targets),
            completions_allowed: parseNumber(data.completions_allowed),
            completion_pct: parseNumber(data.completion_pct),
            yards_allowed: parseNumber(data.yards_allowed),
            yards_allowed_per_cmp: parseNumber(data.yards_allowed_per_cmp),
            yards_allowed_per_tgt: parseNumber(data.yards_allowed_per_tgt),
            tds_allowed: parseNumber(data.tds_allowed),
            passer_rating_allowed: parseNumber(data.passer_rating_allowed),
            adot: parseNumber(data.adot),
            air_yards_completed: parseNumber(data.air_yards_completed),
            yards_after_catch: parseNumber(data.yards_after_catch),
            blitzed: parseNumber(data.blitzed),
            hurried: parseNumber(data.hurried),
            qbkd: parseNumber(data.qbkd),
            sacks: parseNumber(data.sacks),
            pressures: parseNumber(data.pressures),
            tackles_combined: parseNumber(data.tackles_combined),
            tackles_missed: parseNumber(data.tackles_missed),
            tackles_missed_pct: parseNumber(data.tackles_missed_pct),
        };
    }

    public async processStatRecord(season_id: number, row: RawSeasonAdvStatDefData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, SeasonAdvDefTable, SeasonStatId, season_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}