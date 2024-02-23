import { NFLWeeklyAdvStatService } from './advStatService'
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    AdvDefTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import type { 
    RawWeeklyAdvStatDefData,
    AdvDefData
} from '../../interfaces/nfl/weeklyAdvStatsDef';

export class NFLWeeklyAdvStatDefService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_def_stats.columns;
        this.urls = this.config.nfl.player_weekly_adv_def_stats.urls;
    }
    
    public parseAdvDefData(data: RawWeeklyAdvStatDefData): AdvDefData {
        return {
            player_weekly_id: 0,
            targets: (data.targets) ? data.targets : 0,
            completions_allowed: (data.completions_allowed) ? data.completions_allowed : 0,
            completion_pct: (data.completion_pct) ? data.completion_pct : 0,
            yards_allowed: (data.yards_allowed) ? data.yards_allowed : 0,
            yards_allowed_per_cmp: (data.yards_allowed_per_cmp) ? data.yards_allowed_per_cmp : 0,
            yards_allowed_per_tgt: (data.yards_allowed_per_tgt) ? data.yards_allowed_per_tgt : 0,
            rec_td_allowed: (data.rec_td_allowed) ? data.rec_td_allowed : 0,
            passer_rating_allowed: (data.passer_rating_allowed) ? data.passer_rating_allowed : 0,
            adot: (data.adot) ? data.adot : 0,
            air_yards_completed: (data.air_yards_completed) ? data.air_yards_completed : 0,
            yards_after_catch: (data.yards_after_catch) ? data.yards_after_catch : 0,
            blitzed: (data.blitzed) ? data.blitzed : 0,
            hurried: (data.hurried) ? data.hurried : 0,
            pressures: (data.pressures) ? data.pressures : 0,
            tackles_combined: (data.tackles_combined) ? data.tackles_combined : 0,
            tackles_missed: (data.tackles_missed) ? data.tackles_missed : 0,
            tackle_missed_pct: (data.tackle_missed_pct) ? data.tackle_missed_pct : 0,
        };
    }

    public async processAdvDefRecord(week_id: number, row: RawWeeklyAdvStatDefData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, AdvDefTable, WeeklyStatId, week_id, this.parseAdvDefData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyAdvStatDefData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.findPlayer(player);
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.pfr_id}].`, LogContext.NFLWeeklyAdvStatDefService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, player);
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processAdvDefRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatDefService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Adv Def Stat Service started...', LogContext.NFLWeeklyAdvStatDefService);
            await super.runService<RawWeeklyAdvStatDefData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Adv Def Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatDefService);
        }
    }
}