import { logger } from '@log/logger';
import { LogContext } from '@log/log.enums';
import { NFLStatService } from '@data-services/nfl/statService';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';
import { ServiceName } from '@constants/nfl/service.constants';
import { splitString } from '@utils/utils';
import { teamLookup } from '@utils/teamUtils';

import type { 
    LeagueData,
    PlayerData,
    RawSeasonStatData,
    UnmatchedPlayerData,
} from '@interfaces/nfl/stats';


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
            team_id: teamLookup(data.team),
        };
    }

    public override parseUnmatchedPlayerData(data: RawSeasonStatData): UnmatchedPlayerData {
        return {
            pfr_id: data?.pfr_id,
            full_name: data?.full_name,
            stat_service: this.serviceName,
            season: data?.season,
            team_id: teamLookup(data.team),
        };
    }

    // Abstract function 
    public async processStatRecord(season_id: number, row: any): Promise<void> {}

    public override async processPlayerDataRow<T extends RawSeasonStatData>(row: T): Promise<void> {
        try {
            const promises: Promise<void>[] = [];
            const player = this.parsePlayerData(row);
            const player_id = await this.findPlayerById(player, PlayerIdentifiers.PFR);
            if (player_id === 0)
                return;

            promises.push(this.processPlayerRecord(player_id, {pfr_id: row.pfr_id}));
            promises.push(this.processLeagueRecord(player_id, row));

            const seasonStatId = await this.processSeasonRecord(player_id, row);
            if (seasonStatId !== 0) {
                promises.push(this.processStatRecord(seasonStatId, row));
            }
            
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