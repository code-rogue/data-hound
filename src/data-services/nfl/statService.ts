import { DBService } from '../../database/dbService'
import { ColumnMap, downloadCSV, parseCSV } from '../../csv/csvService';
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    NFLSchema,
    BioTable,
    LeagueTable,
    PlayerId,
    WeeklyStatTable,
} from '../../constants/nfl/service.constants'

import type { 
    BioData,
    GameData,
    LeagueData,
    PlayerData,
    RawStatData,
} from '../../interfaces/nfl/stats';

import { splitString } from './utils/utils'
 
export class NFLStatService extends DBService {
    public columns: ColumnMap = {};
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

    public parseBioData(data: RawStatData): BioData {
        return {
            player_id: 0,
            headshot_url: data.headshot_url,
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
    
    public parseGameData(data: RawStatData): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
        };
    }

    public async processBioRecord(player_id: number, row: RawStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, BioTable, PlayerId, player_id, this.parseBioData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processLeagueRecord(player_id: number, row: RawStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, LeagueTable, PlayerId, player_id, this.parseLeagueData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processGameRecord(player_id: number, row: RawStatData): Promise<number> {
        try {
            const gameData = this.parseGameData(row);
            gameData.player_id = player_id;

            const query = `SELECT id FROM ${NFLSchema}.${WeeklyStatTable} WHERE ${PlayerId} = $1 AND season = $2 AND week = $3`;
            const records = await this.fetchRecords<{id: number}>(query, [player_id, gameData.season, gameData.week]);
            if(!records || !records[0] || records[0].id === 0 ) {
                return await this.insertRecord(NFLSchema, WeeklyStatTable, gameData);
            }
            else {
                // remove player_id
                const { player_id, ...updatedData } = gameData;
                const weekly_id = records[0].id;
                await this.updateRecord(NFLSchema, WeeklyStatTable, 'id', weekly_id, updatedData);
                return weekly_id;
            } 
        } catch(error: any) {
            throw error;
        }
    }

    // placeholder since can not use abstract in a non abstract class
    public async processPlayerDataRow(row: any): Promise<void> {
    }
    
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

    public async parseAndLoadWeeklyStats<T extends RawStatData>(url: string): Promise<void> {
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
                promises.push(this.parseAndLoadWeeklyStats<T>(url));
            });
    
            await Promise.all(promises);
        } catch (error: any) {
            console.error('Error: ', error);
            throw error;
        }
    }
}