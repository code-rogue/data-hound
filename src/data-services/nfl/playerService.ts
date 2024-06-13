 import {
    BioTable,
    LeagueTable,
    NFLSchema,
    PlayerId,
    PlayerGSIS,
    PlayerTable,
    CleanPlayerData
} from '@constants/nfl/service.constants';
import { ColumnMap, downloadCSV, parseCSV } from '@csv/csvService';
import { DBService } from '@database/dbService';
import { logger } from '@log/logger';
import { LogContext } from '@log/log.enums';
import { teamLookup } from '@data-services/utils/teamUtils';

import type { 
    BioData,
    LeagueData,
    PlayerData,
    RawPlayerData
 } from '@interfaces/nfl/player';


export class NFLPlayerService extends DBService {
    public columns: ColumnMap = {};
    public urls: string[] =[];
    
    constructor() {
        super();

        this.columns = this.config.nfl.players.columns;
        this.urls = this.config.nfl.players.urls;
    }
    
    public parsePlayerData(data: RawPlayerData): PlayerData {
        return {
            career_status: data.career_status,
            game_status_abbr: data.game_status_abbr,
            game_status: data.game_status,
            esb_id: data.esb_id,
            gsis_id: data.gsis_id,
            gsis_it_id: data.gsis_it_id,
            smart_id: data.smart_id,
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: data.full_name,
            short_name: data.short_name,
            suffix: data.suffix,
        };
    }

    public parseBioData(data: RawPlayerData): BioData {
        return {
            player_id: 0,
            birth_date: this.isValidDateFormat(data.birth_date) ? data.birth_date : null,
            college: data.college,
            college_conference: data.college_conference,
            height: (data.height === "") ? null : data.height,
            weight: (data.weight === "") ? null : data.weight,
            headshot_url: data.headshot_url,
        };
    }

    public parseLeagueData(data: RawPlayerData): LeagueData {
        return {
            player_id: 0,
            position_group: data.position_group,
            position: data.position,
            jersey_number: (data.jersey_number === "") ? null : data.jersey_number,
            years_of_experience: (data.years_of_experience === "") ? null : data.years_of_experience,
            team_id: teamLookup(data.team),
            rookie_year: data.rookie_year,
            draft_team_id: teamLookup(data.draft_team),
            draft_number: data.draft_number,
            draft_round: data.draft_round,
            season: (data.season === "") ? null : data.season
        };
    }

    public async processBioRecord(player_id: number, row: RawPlayerData): Promise<void> {
        try {
            let bioData = this.parseBioData(row);
        
            // strip out the birth date if null
            if(!bioData.birth_date) {
                const { birth_date, ...noBirthDate }: BioData = bioData;
                bioData = noBirthDate as BioData;
            }

            const exists = await this.recordExists(NFLSchema, BioTable, PlayerId, player_id);
            if (exists) {
                // remove player_id from bioData
                const { player_id, ...updateBioData }: BioData = bioData;
                await this.updateRecord(NFLSchema, BioTable, PlayerId, player_id, updateBioData);
            } 
            else {
                // set player_id from bioData
                bioData.player_id = player_id;
                await this.insertRecord(NFLSchema, BioTable, bioData);
            }
        } catch(error: any) {
            throw error;
        }
    }

    public async processLeagueRecord(player_id: number, row: RawPlayerData): Promise<void> {
        try {
            const leagueData = this.parseLeagueData(row);
            const exists = await this.recordExists(NFLSchema, LeagueTable, PlayerId, player_id);
            if (exists) {
                // remove player_id from leagueData
                const { player_id, ...updateLeagueData }: LeagueData = leagueData;
                await this.updateRecord(NFLSchema, LeagueTable, PlayerId, player_id, updateLeagueData);
            } 
            else {
                //set player_id from leagueData
                leagueData.player_id = player_id;
                await this.insertRecord(NFLSchema, LeagueTable, leagueData)
            }
        } catch(error: any) {
            throw error;
        }
    }

    public async processPlayerDataRow(row: RawPlayerData): Promise<void> {
        try {
            const playerData = this.parsePlayerData(row);
            if (!playerData.gsis_id || playerData.gsis_id === '') {
                logger.notice(`Player Record missing GSIS Id: ${JSON.stringify(playerData)}.`, LogContext.NFLPlayerService);
                return;
            }

            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');
            if (player_id !== 0) {
                await this.updateRecord(NFLSchema, PlayerTable, 'id', player_id, playerData);
            } else {
                player_id = await this.insertRecord(NFLSchema, PlayerTable, playerData);
            }

            const promises: Promise<void>[] = [
                this.processBioRecord(player_id, row),
                this.processLeagueRecord(player_id, row),
            ];
            await Promise.all(promises);
            logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLPlayerService);
        } catch(error: any) {
            throw error;
        }
    }
    
    public async processPlayerData(data: RawPlayerData[]): Promise<void> {
        try {
            logger.log(`Processing player records [${data.length}]`, LogContext.NFLPlayerService);
            for await (const row of data) {
                await this.processPlayerDataRow(row);
            }

            logger.log('Processed player records.', LogContext.NFLPlayerService);
        } catch(error: any) {
            throw error;
        }
    }    

    public async parseAndLoadPlayers(url: string): Promise<void> {
        try {
            logger.log(`Downloading and parsing: ${url}`, LogContext.NFLPlayerService);
            const dataFile = await downloadCSV(url);
            const data = await parseCSV<RawPlayerData>(dataFile, this.columns);
            await this.processPlayerData(data);
            logger.log(`Completed processing: ${url}`, LogContext.NFLPlayerService);
            
            
        } catch(error: any) {
            throw error;
        }
    }

    public async runService(): Promise<void> {
        try {
            logger.log('NFL Player Service started...', LogContext.NFLPlayerService);
            for await (const url of this.urls) {
                await this.parseAndLoadPlayers(url);
            }
            await this.callProcedure(NFLSchema, CleanPlayerData);
        } catch (error: any) {
            console.error('Error: ', error);
            logger.error('NFL Player Service did not complete', error.message, LogContext.NFLPlayerService);
        }
    }
}