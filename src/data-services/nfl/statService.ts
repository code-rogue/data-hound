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
    ServiceName,
} from '@constants/nfl/service.constants';

import type { 
    LeagueData,
    PlayerData,
    RawStatData,
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