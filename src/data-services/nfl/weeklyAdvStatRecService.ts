import { NFLWeeklyAdvStatService } from './advStatService'
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    AdvRecTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import type { 
    RawWeeklyAdvStatRecData,
    AdvRecData
} from '../../interfaces/nfl/weeklyAdvStatsRec';

export class NFLWeeklyAdvStatRecService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_rec_stats.columns;
        this.urls = this.config.nfl.player_weekly_adv_rec_stats.urls;
    }
    
    public parseAdvRecData(data: RawWeeklyAdvStatRecData): AdvRecData {
        return {
            player_weekly_id: 0,
            broken_tackles: (data.broken_tackles) ? data.broken_tackles : 0,
            drops: (data.drops) ? data.drops : 0,
            drop_pct: (data.drop_pct) ? data.drop_pct : 0,
            interceptions: (data.interceptions) ? data.interceptions : 0,
            qb_rating: (data.qb_rating) ? data.qb_rating : 0,
        };
    }

    public async processAdvRecRecord(week_id: number, row: RawWeeklyAdvStatRecData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, AdvRecTable, WeeklyStatId, week_id, this.parseAdvRecData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyAdvStatRecData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.findPlayer(player);
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.pfr_id}].`, LogContext.NFLWeeklyAdvStatRecService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, player);
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processAdvRecRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatRecService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Adv Rec Stat Service started...', LogContext.NFLWeeklyAdvStatRecService);
            await super.runService<RawWeeklyAdvStatRecData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Adv Rec Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatRecService);
        }
    }
}