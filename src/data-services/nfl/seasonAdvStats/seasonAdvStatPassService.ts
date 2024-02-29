import { LogContext } from '../../../log/log.enums';
import { NFLSeasonAdvStatService } from './seasonAdvStatService'
import {  
    NFLSchema,
    SeasonAdvPassTable,
    SeasonStatId,
} from '../../../constants/nfl/service.constants'
import { parseNumber } from '../../utils/utils';
import { ServiceName } from '../../../constants/nfl/service.constants';

import type { 
    RawSeasonAdvStatPassData,
    SeasonAdvStatPassData
} from '../../../interfaces/nfl/seasonAdvStats/seasonAdvStatsPass';

export class NFLSeasonAdvStatPassService extends NFLSeasonAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_season_adv_pass_stats.columns;
        this.logContext = LogContext.NFLSeasonAdvStatPassService;
        this.serviceName = ServiceName.NFLSeasonAdvStatPassService;
        this.urls = this.config.nfl.player_season_adv_pass_stats.urls;
    }
    
    public parseStatData(data: RawSeasonAdvStatPassData): SeasonAdvStatPassData {
        return {
            player_season_id: 0,
            attempts: parseNumber(data.attempts),
            throw_aways: parseNumber(data.throw_aways),
            spikes: parseNumber(data.spikes),
            drops: parseNumber(data.drops),
            drop_pct: parseNumber(data.drop_pct),
            bad_throws: parseNumber(data.bad_throws),
            bad_throw_pct: parseNumber(data.bad_throw_pct),
            pocket_time: parseNumber(data.pocket_time),
            blitzed: parseNumber(data.blitzed),
            hurried: parseNumber(data.hurried),
            hit: parseNumber(data.hit),
            pressured: parseNumber(data.pressured),
            pressured_pct: parseNumber(data.pressured_pct),
            batted_balls: parseNumber(data.batted_balls),
            on_tgt_throws: parseNumber(data.on_tgt_throws),
            on_tgt_throws_pct: parseNumber(data.on_tgt_throws_pct),
            rpo_plays: parseNumber(data.rpo_plays),
            rpo_yards: parseNumber(data.rpo_yards),
            rpo_pass_attempts: parseNumber(data.rpo_pass_attempts),
            rpo_pass_yards: parseNumber(data.rpo_pass_yards),
            rpo_rush_attempts: parseNumber(data.rpo_rush_attempts),
            rpo_rush_yards: parseNumber(data.rpo_rush_yards),
            pa_pass_attempts: parseNumber(data.pa_pass_attempts),
            pa_pass_yards: parseNumber(data.pa_pass_yards),
        };
    }

    public async processStatRecord(season_id: number, row: RawSeasonAdvStatPassData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, SeasonAdvPassTable, SeasonStatId, season_id, this.parseStatData(row));
        } catch(error: any) {
            throw error;
        }
    }    
}