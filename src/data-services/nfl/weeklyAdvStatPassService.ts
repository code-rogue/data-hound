import { NFLWeeklyAdvStatService } from './advStatService'
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    AdvPassTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import type { 
    RawWeeklyAdvStatPassData,
    AdvPassData
} from '../../interfaces/nfl/weeklyAdvStatsPass';

export class NFLWeeklyAdvStatPassService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_pass_stats.columns;
        this.urls = this.config.nfl.player_weekly_adv_pass_stats.urls;
    }
    
    public parseAdvPassData(data: RawWeeklyAdvStatPassData): AdvPassData {
        return {
            player_weekly_id: 0,
            pass_drops: (data.pass_drops) ? data.pass_drops : 0.0,
            pass_drop_pct: (data.pass_drop_pct) ? data.pass_drop_pct : 0.0,
            rec_drop: (data.rec_drop) ? data.rec_drop : 0,
            rec_drop_pct: (data.rec_drop_pct) ? data.rec_drop_pct : 0.0,
            bad_throws: (data.bad_throws) ? data.bad_throws : 0.0,
            bad_throw_pct: (data.bad_throw_pct) ? data.bad_throw_pct : 0.0,
            blitzed: (data.blitzed) ? data.blitzed : 0.0,
            hurried: (data.hurried) ? data.hurried : 0.0,
            hit: (data.hit) ? data.hit : 0.0,
            pressured: (data.pressured) ? data.pressured : 0.0,
            pressured_pct: (data.pressured_pct) ? data.pressured_pct : 0.0,
        };
    }

    public async processAdvPassRecord(week_id: number, row: RawWeeklyAdvStatPassData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, AdvPassTable, WeeklyStatId, week_id, this.parseAdvPassData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyAdvStatPassData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.findPlayer(player);
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.pfr_id}].`, LogContext.NFLWeeklyAdvStatPassService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, player);
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processAdvPassRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatPassService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Adv Pass Stat Service started...', LogContext.NFLWeeklyAdvStatPassService);
            await super.runService<RawWeeklyAdvStatPassData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Adv Pass Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatPassService);
        }
    }
}