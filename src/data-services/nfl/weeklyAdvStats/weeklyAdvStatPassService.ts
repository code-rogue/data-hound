import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    WeeklyAdvPassTable,
    WeeklyStatId,
} from '../../../constants/nfl/service.constants'
import { NFLWeeklyAdvStatService } from '../weeklyAdvStats/weeklyAdvStatService';
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawWeeklyAdvStatPassData,
    AdvPassData
} from '../../../interfaces/nfl/weeklyAdvStats/weeklyAdvStatsPass';

export class NFLWeeklyAdvStatPassService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_pass_stats.columns;
        this.logContext = LogContext.NFLWeeklyAdvStatPassService;
        this.serviceName = ServiceName.NFLWeeklyAdvStatPassService;
        this.urls = this.config.nfl.player_weekly_adv_pass_stats.urls;
    }
    
    public parseStatData(data: RawWeeklyAdvStatPassData): AdvPassData {
        return {
            player_weekly_id: 0,
            pass_drops: parseNumber(data.pass_drops),
            pass_drop_pct: parseNumber(data.pass_drop_pct),
            rec_drop: parseNumber(data.rec_drop),
            rec_drop_pct: parseNumber(data.rec_drop_pct),
            bad_throws: parseNumber(data.bad_throws),
            bad_throw_pct: parseNumber(data.bad_throw_pct),
            blitzed: parseNumber(data.blitzed),
            hurried: parseNumber(data.hurried),
            hit: parseNumber(data.hit),
            pressured: parseNumber(data.pressured),
            pressured_pct: parseNumber(data.pressured_pct),
        };
    }

    public override async processStatRecord(week_id: number, row: RawWeeklyAdvStatPassData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, WeeklyAdvPassTable, WeeklyStatId, week_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }

    
}