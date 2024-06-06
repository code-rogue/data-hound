import type { 
    RawWeeklyStatData,
    PlayerData,
    LeagueData,
    GameData,
} from '@interfaces/nfl/stats';
  
export const advStatRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    pfr_id: 'string',
    full_name: 'string',
    headshot_url: 'string',
    team: 'string',
    season: 'string',
    week: '2',
    game_type: 'string',
    opponent: 'string',
    game_id: 'string',
    pfr_game_id: 'string',
};
  
export const noRawAdvStatData: RawWeeklyStatData[] = [];
export const rawAdvStatData: RawWeeklyStatData[] = [advStatRecord];
export const advStatGameData: GameData = {
    player_id: advStatRecord.player_id,
    season: advStatRecord.season,
    week: advStatRecord.week,
    game_type: advStatRecord.game_type,
    opponent: advStatRecord.opponent,
    game_id: advStatRecord.game_id,
    pfr_game_id: advStatRecord.pfr_game_id,
};

export const advStatPlayerData: PlayerData = {
    pfr_id: advStatRecord.pfr_id,
    full_name: advStatRecord.full_name,
};

export const advStatLeagueData: LeagueData = {
    player_id: 0,
    team: advStatRecord.team,
};