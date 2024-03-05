import { logger } from '@log/logger';
import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    PlayerGSIS,
    PlayerTable,
    ServiceName,
} from '@constants/nfl/service.constants';
import { NFLWeeklyStatService } from '@data-services/nfl//weeklyStats/weeklyStatService';

import type { 
    GameData,
    LeagueData,
    PlayerData,
} from '@interfaces/nfl/stats';
import type { RawWeeklyStatData } from '@interfaces/nfl/stats';

export class NFLWeeklyNextGenStatService extends NFLWeeklyStatService {
    constructor() {
        super();

        this.logContext = LogContext.NFLWeeklyNextGenStatService;
        this.serviceName = ServiceName.NFLWeeklyNextGenStatService;
    }
    
    public override parsePlayerData<T extends PlayerData>(data: T): PlayerData {
        return {
            gsis_id: data.gsis_id,
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: data.full_name,
            short_name: data.short_name,
        };
    }

    public override parseGameData<T extends GameData>(data: T): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
        };
    }

    public override parseLeagueData<T extends LeagueData>(data: T): LeagueData {
        return {
            player_id: 0,
            team: data.team,
            position: data.position,
            jersey_number: data.jersey_number,
        };
    }

    // Abstract function 
    public async processStatRecord(week_id: number, row: any): Promise<void> {}

    public override async processPlayerDataRow<T extends RawWeeklyStatData>(row: T): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGSIS, player.gsis_id, 'id');
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.gsis_id}].`, this.logContext);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, player);
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processStatRecord(weeklyStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, this.logContext);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService<T extends RawWeeklyStatData>(): Promise<void> {
        try {
            logger.log(`${this.serviceName} started...`, this.logContext);
            await super.runService<T>();
        } catch (error: any) {
            logger.error(`${this.serviceName} did not complete`, error.message, this.logContext);
        }
    }
}