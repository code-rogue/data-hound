import type { 
    RawSeasonStatData,
    LeagueData,
    PlayerData,
    SeasonData
} from '../../../../../src/interfaces/nfl/stats';
  
export const seasonAdvStatRecord = {
    player_id: 1001,
    player_season_id: 100,
    pfr_id: 'string',
    full_name: 'string',
    team: 'string',
    season: 'string',
    age: 22,
    games_played: 16,
    games_started: 16,
};
  
export const seasonAdvStatBaseRecord = {
    player_id: 1001,
    player_season_id: 100,
    pfr_id: 'string',
    full_name: 'string',
    team: 'string',
    season: 'string',
};

export const noRawSeasonAdvStatData: RawSeasonStatData[] = [];
export const rawSeasonAdvStatData: RawSeasonStatData[] = [seasonAdvStatRecord];

export const seasonAdvStatData: SeasonData = {
    player_id: seasonAdvStatRecord.player_id,
    season: seasonAdvStatRecord.season,
    age: seasonAdvStatRecord.age,
    games_played: seasonAdvStatRecord.games_played,
    games_started: seasonAdvStatRecord.games_started,
};

export const seasonAdvStatPlayerData: PlayerData = {
    pfr_id: seasonAdvStatRecord.pfr_id,
    full_name: seasonAdvStatRecord.full_name,
};

export const seasonAdvStatLeagueData: LeagueData = {
    player_id: 0,
    team: seasonAdvStatRecord.team,
};