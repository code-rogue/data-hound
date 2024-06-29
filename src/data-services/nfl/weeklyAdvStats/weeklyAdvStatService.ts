import { logger } from '@log/logger';
import { LogContext } from '@log/log.enums';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
import { ServiceName } from '@constants/nfl/service.constants';
import { splitString } from '@utils/utils';
import { teamLookup } from '@utils/teamUtils';

import type { 
    GameData,
    LeagueData,
    PlayerData,
    UnmatchedPlayerData,
} from '@interfaces/nfl/stats';
import type { RawWeeklyStatData } from '@interfaces/nfl/stats';

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

    public override parseGameData<T extends RawWeeklyStatData>(data: T): GameData {
        return {
            player_id: 0,
            game_id: data.game_id,
            pfr_game_id: data.pfr_game_id,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
            opponent_id: teamLookup(data.opponent),
            team_id: teamLookup(data.team),
        };
    }

    public override parseLeagueData<T extends LeagueData>(data: T): LeagueData {
        return {
            player_id: 0,
            team_id: teamLookup(data.team),
        };
    }

    public parseUnmatchedPlayerData(data: RawWeeklyStatData): UnmatchedPlayerData {
        return {
            pfr_id: data?.pfr_id,
            full_name: data?.full_name,
            stat_service: this.serviceName,
            season: data?.season,
            week: data?.week,
            team_id: teamLookup(data.team),
        };
    }

    // Abstract function 
    public async processStatRecord(week_id: number, row: any): Promise<void> {}

    public override async processPlayerDataRow<T extends RawWeeklyStatData>(row: T): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);
            const player_id = await this.findPlayerById(player, PlayerIdentifiers.PFR);
            if (player_id === 0)
                return;
            
            promises.push(this.processPlayerRecord(player_id, {pfr_id: row.pfr_id}));
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