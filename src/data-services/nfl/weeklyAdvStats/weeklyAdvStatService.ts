import { logger } from '../../../log/logger';
import { LogContext } from '../../../log/log.enums';
import {
    NFLSchema,
    PlayerTable,
} from '../../../constants/nfl/service.constants';
import { NFLWeeklyStatService } from '../weeklyStats/weeklyStatService';
import { ServiceName } from '../../../constants/nfl/service.constants';
import { splitString } from '../../utils/utils'

import type { 
    GameData,
    LeagueData,
    PlayerData,
} from '../../../interfaces/nfl/stats';
import type { RawWeeklyStatData } from '../../../interfaces/nfl/stats';

export class NFLWeeklyAdvStatService extends NFLWeeklyStatService {
    constructor() {
        super();

        this.logContext = LogContext.NFLWeeklyAdvStatService;
        this.serviceName = ServiceName.NFLWeeklyAdvStatService;
    }
    
    public override parsePlayerData<T extends PlayerData>(data: T): PlayerData {
        const {firstPart: first_name, secondPart: last_name} = splitString(data.full_name, ' ');
        return {
            pfr_id: data.pfr_id,
            first_name,
            last_name,
            full_name: data.full_name,
        };
    }

    public override parseGameData<T extends GameData>(data: T): GameData {
        return {
            player_id: 0,
            game_id: data.game_id,
            pfr_game_id: data.pfr_game_id,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
            opponent: data.opponent,
        };
    }

    public override parseLeagueData<T extends LeagueData>(data: T): LeagueData {
        return {
            player_id: 0,
            team: data.team,
        };
    }

    // Abstract function 
    public async processStatRecord(week_id: number, row: any): Promise<void> {}

    public override async processPlayerDataRow<T extends RawWeeklyStatData>(row: T): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.findPlayerByPFR(player);
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.pfr_id}].`, this.logContext);

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