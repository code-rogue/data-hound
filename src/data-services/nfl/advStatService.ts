import { NFLStatService } from './statService'

import {
    NFLSchema,
    PlayerFullName,
    PlayerPFR,
    PlayerTable,
} from '../../constants/nfl/service.constants'

import { splitString } from './utils/utils'

import type { 
    GameData,
    LeagueData,
    PlayerData,
} from '../../interfaces/nfl/stats';

export class NFLWeeklyAdvStatService extends NFLStatService {
    constructor() {
        super();
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

    public override parseGameData<T extends GameData>(data: T): GameData {
        return {
            player_id: 0,
            game_id: data.game_id,
            pfr_game_id: data.pfr_game_id,
            season: data.season,
            week: data.week,
            game_type: data.game_type,
            opponent: data.opponent,
        };
    }

    public override parseLeagueData<T extends LeagueData>(data: T): LeagueData {
        return {
            player_id: 0,
            team: data.team,
        };
    }

    public async findPlayer(player: PlayerData): Promise<number> {
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
}