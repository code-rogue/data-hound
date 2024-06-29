import {
    BioTable,
    NFLSchema,
    PlayerId,
    ServiceName,
    WeeklyStatTable,
} from '@constants/nfl/service.constants';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';
import { teamLookup } from '@utils/teamUtils';

import type { 
    BioData,
    GameData,
    RawWeeklyStatData,
    UnmatchedPlayerData,
} from '@interfaces/nfl/stats';

export class NFLWeeklyStatService extends NFLStatService {
    constructor() {
        super();

        this.logContext = LogContext.NFLWeeklyStatService;
        this.serviceName = ServiceName.NFLWeeklyStatService;
    }

    public parseBioData(data: RawWeeklyStatData): BioData {
        return {
            player_id: 0,
            headshot_url: data.headshot_url,
        };
    }

    public parseGameData(data: RawWeeklyStatData): GameData {
        return {
            player_id: 0,
            season: data.season,
            week: data.week,
            opponent_id: teamLookup(data.opponent),
            team_id: teamLookup(data.team),
        };
    }

    public override parseUnmatchedPlayerData(data: RawWeeklyStatData): UnmatchedPlayerData {
        return {
            gsis_id: data?.gsis_id,
            full_name: data?.full_name,
            stat_service: this.serviceName,
            season: data?.season,
            week: data?.week,
            team_id: teamLookup(data.team),
        };
    }

    public async processBioRecord(player_id: number, row: RawWeeklyStatData): Promise<void> {
        try {
            await this.processRecord(NFLSchema, BioTable, PlayerId, player_id, this.parseBioData(row));
        } catch(error: any) {
            throw error;
        }
    }

    public async processGameRecord(player_id: number, row: RawWeeklyStatData): Promise<number> {
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

    // Abstract function 
    public async processStatRecord(week_id: number, row: any): Promise<void> {}

    public async processPlayerDataRow<T extends RawWeeklyStatData>(row: T): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const playerData = this.parsePlayerData(row);
            const player_id = await this.findPlayerById(playerData, PlayerIdentifiers.GSIS);
            if(player_id === 0)
                return;

            promises.push(this.processBioRecord(player_id, row));
            promises.push(this.processLeagueRecord(player_id, row));

            const weeklyStatId = await this.processGameRecord(player_id, row);
            if (weeklyStatId !== 0)
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