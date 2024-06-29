import { ColumnMap, downloadCSV, parseCSV } from '@csv/csvService';
import { DBService } from '@database/dbService';
import { logger } from '@log/logger';
import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    LeagueTable,
    PlayerFullName,
    PlayerId,
    PlayerPFR,
    PlayerTable,
    SeasonStatTable,
    ServiceName,
    PlayerGSIS,
    UnmatchedPlayerStatsTable,
} from '@constants/nfl/service.constants';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';
import { teamLookup } from '@utils/teamUtils';

import type { 
    LeagueData,
    PlayerData,
    RawStatData,
    RawSeasonStatData,
    SeasonData,
    UnmatchedPlayerData,
} from '@interfaces/nfl/stats';
import { splitString } from '@utils/utils';
 
export class NFLStatService extends DBService {
    public columns: ColumnMap = {};
    public logContext = LogContext.NFLWeeklyAdvStatService;
    public serviceName = ServiceName.NFLWeeklyAdvStatService;
    public urls: string[] =[];

    constructor() {
        super();
    }

    public parsePlayerData(data: RawStatData): PlayerData {
        const {firstPart: first_name, secondPart: last_name} = splitString(data.full_name, ' ');
        return {
            gsis_id: data.gsis_id,
            first_name,
            last_name,
            full_name: data.full_name,
            short_name: data.short_name,
        };
    }

    public parseLeagueData(data: RawStatData): LeagueData {
        return {
            player_id: 0,
            position: data.position,
            position_group: data.position_group,
            team_id: teamLookup(data.team),
        };
    }
    
    public async processLeagueRecord(player_id: number, row: RawStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, LeagueTable, PlayerId, player_id, this.parseLeagueData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processPlayerRecord(player_id: number, data: PlayerData): Promise<void> {
        try {
            await this.updateRecord(NFLSchema, PlayerTable, 'id', player_id, data);
        } catch(error: any) {
            throw error;
        }
    }

    public parseSeasonData<T extends SeasonData>(data: T): SeasonData {
        return {
            player_id: 0,
            season: data.season,
            age: data?.age ?? 0,
            games_played: data?.games_played ?? 0,
            games_started: data?.games_started ?? 0,
            team_id: teamLookup(data.team),
        };
    }
    
    public parseUnmatchedPlayerData(data: RawStatData): UnmatchedPlayerData {
        return {
            gsis_id: data?.gsis_id,
            pfr_id: data?.pfr_id,
            full_name: data?.full_name,
            stat_service: this.serviceName,
            team_id: teamLookup(data.team),
        }
    }

    // placeholder since can not use abstract in a non abstract class
    public async processPlayerDataRow(row: any): Promise<void> {}
    public async processProcedures(): Promise<void> {}
    
    public async processPlayerData(data: RawStatData[]): Promise<void> {
        try {
            logger.log(`Processing player records [${data.length}]`, LogContext.NFLStatService);
            for await (const row of data) {
                await this.processPlayerDataRow(row);
            }

            logger.log('Processed player stat records.', LogContext.NFLStatService);
        } catch(error: any) {
            throw error;
        }
    }

    public async findPlayerById(player: PlayerData, lookupId: PlayerIdentifiers): Promise<number> {
        let player_id = 0;
        try {
            switch (lookupId) {
                case PlayerIdentifiers.GSIS: {
                    player_id = await this.findPlayerIdByGSIS(player);
                    break;
                }
                case PlayerIdentifiers.PFR: {
                    player_id = await this.findPlayerIdByPFR(player);
                    break;
                }
            }

            // If only one player record matches full name then use it
            if (player_id === 0) {                
                player_id = await this.findPlayerIdByName(player);                
            }

            // Record unmatched player record
            if (player_id === 0) {
                await this.insertRecord(NFLSchema, UnmatchedPlayerStatsTable, this.parseUnmatchedPlayerData(player));
            }

            return player_id;
        } catch (error: any) {
            throw error;
        }
    }

    public async findPlayerIdByName(player: PlayerData): Promise<number> {
        try {
            // Must have a non-blank full_name
            if (!player.full_name || player.full_name === '') {
                logger.notice(`Player Record missing Full Name: ${JSON.stringify(player)}.`, LogContext.NFLStatService);
                return 0;
            }

            const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerFullName} = $1`;
            const result = await this.fetchRecords<{id: number}>(query, [player.full_name]);
            if(result) {
                if(result.length === 1) {
                    return result[0].id;
                }
                
                logger.notice(`Unable to identify Player: '${player.full_name}' returned ${result.length} records`, LogContext.NFLStatService);
            }
            
            return 0;
        } catch(error: any) {
            throw error;
        }
    }
    
    public async findPlayerIdByGSIS(player: PlayerData): Promise<number> {
        try {
            // Must have a non-blank gsis_id
            if (!player.gsis_id || player.gsis_id === '') {
                logger.notice(`Player Record missing GSIS Id: ${JSON.stringify(player)}.`, LogContext.NFLStatService);
                return 0;
            }

            const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerGSIS} = $1`;
            const result = await this.fetchRecords<{id: number}>(query, [player.gsis_id]);
            if (result && result[0])
                return result[0].id;
            
            return 0;
        } catch(error: any) {
            throw error;
        }
    }

    public async findPlayerIdByPFR(player: PlayerData): Promise<number> {
        try {
            // Must have a non-blank pfr_id
            if (!player.pfr_id || player.pfr_id === '') {
                logger.notice(`Player Record missing PFR Id: ${JSON.stringify(player)}.`, LogContext.NFLStatService);
                return 0;
            }

            const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerPFR} = $1`;
            const result = await this.fetchRecords<{id: number}>(query, [player.pfr_id]);
            if(result && result[0])
                return result[0].id;
            
            return 0;
        } catch(error: any) {
            throw error;
        }
    }

    public async processSeasonRecord(player_id: number, row: RawSeasonStatData): Promise<number> {
        try {
            const seasonData = this.parseSeasonData(row);
            seasonData.player_id = player_id;

            if(!seasonData?.team_id || seasonData.team_id === null || seasonData.team_id === 0) {
                logger.warn(`Unable to process Season Record for Player Id: ${player_id} - Team: ${seasonData?.team_id}`, LogContext.NFLStatService);
                return 0;
            }

            const query = `SELECT id FROM ${NFLSchema}.${SeasonStatTable} WHERE ${PlayerId} = $1 AND season = $2 AND team_id = $3`;
            const records = await this.fetchRecords<{id: number}>(query, [player_id, seasonData.season, seasonData.team_id]);
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

    public async parseAndLoadStats<T extends RawStatData>(url: string): Promise<void> {
        try {
            logger.log(`Downloading and parsing: ${url}`, LogContext.NFLStatService);
            const dataFile = await downloadCSV(url);
            const data = await parseCSV<T>(dataFile, this.columns);
            await this.processPlayerData(data);
            logger.log(`Completed processing: ${url}`, LogContext.NFLStatService);
        } catch(error: any) {
            throw error;
        }
    }

    public async runService<T extends RawStatData>(): Promise<void> {
        try {
            for await (const url of this.urls) {
                await this.parseAndLoadStats<T>(url);
            }
            await this.processProcedures();
        } catch (error: any) {
            console.error('Error: ', error);
            throw error;
        }
    }
}