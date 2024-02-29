import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    WeeklyAdvDefTable,
    WeeklyStatId,
} from '../../../constants/nfl/service.constants';
import { NFLWeeklyAdvStatService } from '../weeklyAdvStats/weeklyAdvStatService';
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawWeeklyAdvStatDefData,
    WeeklyAdvDefData
} from '../../../interfaces/nfl/weeklyAdvStats/weeklyAdvStatsDef';

export class NFLWeeklyAdvStatDefService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_def_stats.columns;
        this.logContext = LogContext.NFLWeeklyAdvStatDefService;
        this.serviceName = ServiceName.NFLWeeklyAdvStatDefService;
        this.urls = this.config.nfl.player_weekly_adv_def_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyAdvStatDefData): WeeklyAdvDefData {
        return {
            player_weekly_id: 0,
            targets: parseNumber(data.targets),
            completions_allowed: parseNumber(data.completions_allowed),
            completion_pct: parseNumber(data.completion_pct),
            yards_allowed: parseNumber(data.yards_allowed),
            yards_allowed_per_cmp: parseNumber(data.yards_allowed_per_cmp),
            yards_allowed_per_tgt: parseNumber(data.yards_allowed_per_tgt),
            rec_td_allowed: parseNumber(data.rec_td_allowed),
            passer_rating_allowed: parseNumber(data.passer_rating_allowed),
            adot: parseNumber(data.adot),
            air_yards_completed: parseNumber(data.air_yards_completed),
            yards_after_catch: parseNumber(data.yards_after_catch),
            blitzed: parseNumber(data.blitzed),
            hurried: parseNumber(data.hurried),
            pressures: parseNumber(data.pressures),
            tackles_combined: parseNumber(data.tackles_combined),
            tackles_missed: parseNumber(data.tackles_missed),
            tackles_missed_pct: parseNumber(data.tackles_missed_pct),
        };
    }

    public async processStatRecord(week_id: number, row: RawWeeklyAdvStatDefData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyAdvDefTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }
}