import { DBService } from '../../database/dbService'
import { downloadCSV, parseCSV } from '../../csv/csvService';
import { logger } from '../../log/logger';
import { LogContext } from '../../log/log.enums';

import {
    NFLSchema,
    BioTable,
    LeagueTable,
    PassTable,
    PlayerTable,
    WeeklyStatTable,
    RecTable,
    RushTable,
    PlayerId,
} from '../../constants/nfl/service.constants'

import type { 
    RawWeeklyStatData,
    BioData,
    PlayerData,
    GameData,
    LeagueData,
    PassData,
    RushData,
    RecData,
    RecordData,
} from '../../interfaces/nfl/nflPlayerWeeklyStats';

export const WeeklyStatId = 'player_weekly_id';
export const PlayerGUID = 'gsis_id';
 
export class NFLWeeklyStatService extends DBService {
    constructor() {
        super();
    }
    
    public parsePlayerData(data: RawWeeklyStatData): PlayerData {
        return {
            gsis_id: data.gsis_id,
            full_name: data.full_name,
            short_name: data.short_name,
        };
    }

    public parseBioData(data: RawWeeklyStatData): BioData {
        return {
            player_id: 0,
            headshot_url: data.headshot_url,
        };
    }

    public parseLeagueData(data: RawWeeklyStatData): LeagueData {
        return {
            player_id: 0,
            position: data.position,
            position_group: data.position_group,
            team: data.team,
        };
    }

    public parseGameData(data: RawWeeklyStatData): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
            opponent: data.opponent,
            fantasy_points: data.fantasy_points,
            fantasy_points_ppr: data.fantasy_points_ppr,
        };
    }

    public parsePassData(data: RawWeeklyStatData): PassData {
        return {
            player_weekly_id: 0,
            attempts: data.attempts,
            completions: data.completions,
            pass_yards: (data.pass_yards) ? data.pass_yards : 0,
            pass_yards_after_catch: (data.pass_yards_after_catch) ? data.pass_yards_after_catch : 0,
            pass_air_yards: (data.pass_air_yards) ? data.pass_air_yards : 0,
            pass_air_conversion_ratio: (data.pass_air_conversion_ratio) ? data.pass_air_conversion_ratio : 0,
            pass_first_downs: data.pass_first_downs,
            dakota: (data.dakota) ? data.dakota : 0,
            pass_epa: (data.pass_epa) ? data.pass_epa : 0,
            pass_tds: data.pass_tds,
            pass_two_pt_conversions: data.pass_two_pt_conversions,
            interceptions: data.interceptions,
            sacks: (data.sacks) ? data.sacks : 0,
            sack_yards: (data.sack_yards) ? data.sack_yards : 0,
            sack_fumbles: data.sack_fumbles,
            sack_fumbles_lost: data.sack_fumbles_lost,
        };
    }

    public parseRushData(data: RawWeeklyStatData): RushData {
        return {
            player_weekly_id: 0,
            carries: data.carries,
            rush_yards: (data.rush_yards) ? data.rush_yards : 0,
            rush_first_downs: data.rush_first_downs,
            rush_epa: (data.rush_epa) ? data.rush_epa : 0,
            rush_tds: data.rush_tds,
            rush_two_pt_conversions: data.rush_two_pt_conversions,
            rush_fumbles: data.rush_fumbles,
            rush_fumbles_lost: data.rush_fumbles_lost,
            special_teams_tds: data.special_teams_tds,
        };
    }

    public parseRecData(data: RawWeeklyStatData): RecData {
        return {
            player_weekly_id: 0,
            targets: data.targets,
            receptions: data.receptions,
            target_share: (data.target_share) ? data.target_share : 0,
            rec_yards: (data.rec_yards) ? data.rec_yards : 0,
            rec_yards_after_catch: (data.rec_yards_after_catch) ? data.rec_yards_after_catch : 0,
            rec_air_yards: (data.rec_air_yards) ? data.rec_air_yards : 0,
            rec_air_yards_share: (data.rec_air_yards_share) ? data.rec_air_yards_share : 0,
            rec_air_conversion_ratio: (data.rec_air_conversion_ratio) ? data.rec_air_conversion_ratio : 0,
            weighted_opportunity_rating: (data.weighted_opportunity_rating) ? data.weighted_opportunity_rating : 0,
            rec_epa: (data.rec_epa) ? data.rec_epa : 0,
            rec_tds: data.rec_tds,
            rec_two_pt_conversions: data.rec_two_pt_conversions,
            rec_first_downs: data.rec_first_downs,
            rec_fumbles: data.rec_fumbles,
            rec_fumbles_lost: data.rec_fumbles_lost,
        };
    }

    public async processRecord<T extends RecordData>(
        schema: string,
        table: string, 
        idColumn: keyof T, 
        id: number, 
        data: T
    ): Promise<void | number> {
        try {
            const exists = await this.recordExists(schema, table, idColumn as string, id);
            if (exists) {
                // remove id column
                const { [idColumn]: _, ...updatedData } = data;
                return await this.updateRecord(schema, table, idColumn as string, id, updatedData);
            } 
            else {
                // set id column
                (data as RecordData)[idColumn as keyof RecordData] = id;
                return await this.insertRecord(schema, table, data);
            }
        } catch(error: any) {
            throw error;
        }
    }

    public async processBioRecord(player_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, BioTable, PlayerId, player_id, this.parseBioData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processLeagueRecord(player_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, LeagueTable, PlayerId, player_id, this.parseLeagueData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processPassRecord(week_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, PassTable, WeeklyStatId, week_id, this.parsePassData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processRushRecord(week_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, RushTable, WeeklyStatId, week_id, this.parseRushData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processRecRecord(week_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, RecTable, WeeklyStatId, week_id, this.parseRecData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processGameRecord(player_id: number, row: RawWeeklyStatData): Promise<number> {
        try {
            const gameData = this.parseGameData(row);
            gameData.player_id = player_id;

            const query = `SELECT id FROM ${NFLSchema}.${WeeklyStatTable} WHERE ${PlayerId} = $1 AND week = $2`;
            const records = await this.fetchRecords<{id: number}>(query, [player_id, gameData.week]);
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

    public async processPlayerDataRow(row: RawWeeklyStatData): Promise<void> {
        try {
            const promises: Promise<void>[] = [];

            const playerData = this.parsePlayerData(row);
            let player_id = await this.recordLookup(NFLSchema, PlayerTable, PlayerGUID, playerData.gsis_id, 'id');
            if(player_id === 0) {
                logger.debug(`No Player Found, creating player record.`, LogContext.NFLWeeklyStatsService);

                player_id = await this.insertRecord(NFLSchema, PlayerTable, playerData);
                promises.push(this.processBioRecord(player_id, row));
                promises.push(this.processLeagueRecord(player_id, row));
            }

            const weeklyStatId = await this.processGameRecord(player_id, row);

            promises.push(this.processPassRecord(weeklyStatId, row));
            promises.push(this.processRushRecord(weeklyStatId, row));
            promises.push(this.processRecRecord(weeklyStatId, row));
            Promise.all(promises)
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                logger.debug(`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatsService);
            });
        } catch(error: any) {
            throw error;
        }
    }
    
    public async processPlayerData(data: RawWeeklyStatData[]): Promise<void> {
        try {
            logger.log(`Processing player records [${data.length}]`, LogContext.NFLWeeklyStatsService);
            data.forEach(async row => {
                await this.processPlayerDataRow(row);
            });
        } catch(error: any) {
            throw error;
        } finally {
            logger.log('Processed player records.', LogContext.NFLWeeklyStatsService);
        }
    }    

    public async runService(): Promise<void> {
        try {
            logger.log('NFL Player Weekly Stats Service started...', LogContext.NFLWeeklyStatsService);
            const dataFile = await downloadCSV(this.config.nfl.player_weekly_stats.url);
            const data = await parseCSV<RawWeeklyStatData>(dataFile, this.config.nfl.player_weekly_stats.columns);

            await this.processPlayerData(data);
        } catch (error: any) {
            console.error('Error: ', error);
            logger.error('NFL Player Weekly Stats Service did not complete', error.message, LogContext.NFLWeeklyStatsService);
        }
    }
}