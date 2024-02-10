import { getConfigurationData } from '../../config/configData';
import { DBService } from '../../database/dbService'
import { downloadCSV, parseCSV } from '../../csv/csvService';
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import type { 
    RawPlayerData, 
    PlayerData,
    BioData,
    LeagueData,
 } from '../../interfaces/nfl/nflPlayer';

export const NFLSchema = "nfl"
export const PlayerTable = "players"
export const BioTable = "player_bio"
export const LeagueTable = "player_league"
export const PlayerId = "player_id"
export const PlayerGUID = "smart_id"

export class NFLPlayerService extends DBService {
    constructor() {
        super();
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
            team: data.team,
            team_seq: data.team_seq,
            team_id: data.team_id,
            rookie_year: data.rookie_year,
            draft_team: data.draft_team,
            draft_number: data.draft_number,
            draft_round: data.draft_round,
            season: data.season,
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
            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGUID, playerData.smart_id, 'id');
            if(player_id !== 0) {
                await this.updateRecord(NFLSchema, PlayerTable, 'id', player_id, playerData);
            } else {
                player_id = await this.insertRecord(NFLSchema, PlayerTable, playerData);
            }

            const promises: Promise<void>[] = [
                this.processBioRecord(player_id, row),
                this.processLeagueRecord(player_id, row),
            ];
            Promise.all(promises)
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLPlayerService);
            });
        } catch(error: any) {
            throw error;
        }
    }
    
    public async processPlayerData(data: RawPlayerData[]): Promise<void> {
        try {
            logger.log(`Processing player records [${data.length}]`, LogContext.NFLPlayerService);
            data.forEach(async row => {
                await this.processPlayerDataRow(row);
            });
        } catch(error: any) {
            throw error;
        } finally {
            logger.log('Processed player records.', LogContext.NFLPlayerService);
        }
    }    

    public async runService(): Promise<void> {
        try {
            logger.log('NFL Player Service started...', LogContext.NFLPlayerService);
            const dataFile = await downloadCSV(this.config.nfl.players.url);
            const data = await parseCSV<RawPlayerData>(dataFile, this.config.nfl.players.columns);

            await this.processPlayerData(data);
        } catch (error: any) {
            console.error('Error: ', error);
            logger.error('NFL Player Service did not complete', error.message, LogContext.NFLPlayerService);
        }
    }
}