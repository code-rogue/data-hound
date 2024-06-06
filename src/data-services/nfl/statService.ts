import { DBService } from '@database/dbService';
import { ColumnMap, downloadCSV, parseCSV } from '@csv/csvService';
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
} from '@constants/nfl/service.constants';

import type { 
    LeagueData,
    PlayerData,
    RawStatData,
    RawSeasonStatData,
    SeasonData,
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
            team: data.team,
        };
    }
    
    public async processLeagueRecord(player_id: number, row: RawStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, LeagueTable, PlayerId, player_id, this.parseLeagueData(row));
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
        };
    }

    // placeholder since can not use abstract in a non abstract class
    public async processPlayerDataRow(row: any): Promise<void> {}
    
    public async processPlayerData(data: RawStatData[]): Promise<void> {
        try {
            logger.log(`Processing player records [${data.length}]`, LogContext.NFLStatService);
            const promises = data.map((row) => this.processPlayerDataRow(row));

            // Now await all promises in parallel
            await Promise.all(promises);

            logger.log('Processed player records.', LogContext.NFLStatService);
        } catch(error: any) {
            throw error;
        }
    }
    
    public async findPlayerByPFR(player: PlayerData): Promise<number> {
        try {
            const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerPFR} = $1 OR ${PlayerFullName} = $2`;
            const keys = [player.pfr_id ?? '', player.full_name];
            
            const result = await this.fetchRecords<{id: number}>(query, keys);
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
            const promises: Promise<void>[] = [];
            this.urls.forEach(url => {
                promises.push(this.parseAndLoadStats<T>(url));
            });
    
            await Promise.all(promises);
        } catch (error: any) {
            console.error('Error: ', error);
            throw error;
        }
    }
}