import { logger } from '../../../log/logger';
import { LogContext } from '../../../log/log.enums';
import { NFLStatService } from '../statService';
import {
    NFLSchema,
    PlayerId,
    PlayerTable,
    SeasonStatTable,
} from '../../../constants/nfl/service.constants';

import type { 
    LeagueData,
    PlayerData,
    RawSeasonStatData,
    SeasonData,
} from '../../../interfaces/nfl/stats';
import { ServiceName } from '../../../constants/nfl/service.constants';
import { splitString } from '../../utils/utils';

export class NFLSeasonAdvStatService extends NFLStatService {
    constructor() {
        super();

        this.logContext = LogContext.NFLSeasonAdvStatService;
        this.serviceName = ServiceName.NFLSeasonAdvStatService;
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

    public override parseLeagueData<T extends LeagueData>(data: T): LeagueData {
        return {
            player_id: 0,
            team: data.team,
        };
    }

    public parseSeasonData<T extends SeasonData>(data: T): SeasonData {
        return {
            player_id: 0,
            season: data.season,
            age: data?.age ?? 0,
            games_played: data?.games_played ?? 0,
            games_started: data?.games_started ?? 0,
        };
    }

    public async processSeasonRecord(player_id: number, row: RawSeasonStatData): Promise<number> {
        try {
            const seasonData = this.parseSeasonData(row);
            seasonData.player_id = player_id;

            const query = `SELECT id FROM ${NFLSchema}.${SeasonStatTable} WHERE ${PlayerId} = $1 AND season = $2`;
            const records = await this.fetchRecords<{id: number}>(query, [player_id, seasonData.season]);
            if(!records || !records[0] || records[0].id === 0 ) {
                return await this.insertRecord(NFLSchema, SeasonStatTable, seasonData);
            }
            else {
                // remove player_id
                const { player_id, ...updatedData } = seasonData;
                const season_id = records[0].id;
                await this.updateRecord(NFLSchema, SeasonStatTable, 'id', season_id, updatedData);
                return season_id;
            } 
        } catch(error: any) {
            throw error;
        }
    }

    // Abstract function 
    public async processStatRecord(season_id: number, row: any): Promise<void> {}

    public override async processPlayerDataRow<T extends RawSeasonStatData>(row: T): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);

            let player_id = await this.findPlayerByPFR(player);
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record: ${player.full_name} [${player.pfr_id}].`, this.logContext);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, player);
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const seasonStatId = await this.processSeasonRecord(player_id, row);

            promises.push(this.processStatRecord(seasonStatId, row));
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, this.logContext);
        } catch(error: any) {
            throw error;
        }
    }

    public override async runService<T extends RawSeasonStatData>(): Promise<void> {
        try {
            logger.log(`${this.serviceName} started...`, this.logContext);
            await super.runService<T>();
        } catch (error: any) {
            logger.error(`${this.serviceName} did not complete`, error.message, this.logContext);
        }
    }
}