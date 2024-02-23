import { NFLWeeklyAdvStatService } from './advStatService'
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    AdvRushTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../constants/nfl/service.constants'

import type { 
    RawWeeklyAdvStatRushData,
    AdvRushData
} from '../../interfaces/nfl/weeklyAdvStatsRush';

export class NFLWeeklyAdvStatRushService extends NFLWeeklyAdvStatService {
    constructor() {
        super();

        this.columns = this.config.nfl.player_weekly_adv_rush_stats.columns;
        this.urls = this.config.nfl.player_weekly_adv_rush_stats.urls;
    }
    
    public parseAdvRushData(data: RawWeeklyAdvStatRushData): AdvRushData {
        return {
            player_weekly_id: 0,
            yards_before_contact: (data.yards_before_contact) ? data.yards_before_contact : 0,
            yards_before_contact_avg: (data.yards_before_contact_avg) ? data.yards_before_contact_avg : 0,
            yards_after_contact: (data.yards_after_contact) ? data.yards_after_contact : 0,
            yards_after_contact_avg: (data.yards_after_contact_avg) ? data.yards_after_contact_avg : 0,
            broken_tackles: (data.broken_tackles) ? data.broken_tackles : 0,
        };
    }

    public async processAdvRushRecord(week_id: number, row: RawWeeklyAdvStatRushData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, AdvRushTable, WeeklyStatId, week_id, this.parseAdvRushData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public override async processPlayerDataRow(row: RawWeeklyAdvStatRushData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.findPlayer(player);
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.pfr_id}].`, LogContext.NFLWeeklyAdvStatRushService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, player);
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processAdvRushRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatRushService);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Adv Rush Stat Service started...', LogContext.NFLWeeklyAdvStatRushService);
            await super.runService<RawWeeklyAdvStatRushData>();
        } catch (error: any) {
            logger.error('NFL Player Weekly Adv Rush Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatRushService);
        }
    }
}