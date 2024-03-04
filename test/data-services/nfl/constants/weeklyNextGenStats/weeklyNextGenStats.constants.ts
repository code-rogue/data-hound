import type { 
    RawWeeklyStatData,
    PlayerData,
    LeagueData,
    GameData,
} from '../../../../../src/interfaces/nfl/stats';
  
export const nextGenStatRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    gsis_id: 'string',
    first_name: 'string',
    last_name: 'string',
    full_name: 'string',
    short_name: 'string',
    headshot_url: 'string',
    position: 'WR',
    jersey_number: '5',
    team: 'string',
    season: 'string',
    week: 2,
    game_type: 'string',
};
  
export const noRawNextGenStatData: RawWeeklyStatData[] = [];
export const rawNextGenStatData: RawWeeklyStatData[] = [nextGenStatRecord];

export const nextGenStatGameData: GameData = {
    player_id: nextGenStatRecord.player_id,
    season: nextGenStatRecord.season,
    week: nextGenStatRecord.week,
    game_type: nextGenStatRecord.game_type,
};

export const nextGenStatPlayerData: PlayerData = {
    gsis_id: nextGenStatRecord.gsis_id,
    full_name: nextGenStatRecord.full_name,
    first_name: nextGenStatRecord.first_name,
    last_name: nextGenStatRecord.last_name,
    short_name: nextGenStatRecord.short_name,
};

export const nextGenStatLeagueData: LeagueData = {
    player_id: nextGenStatRecord.player_id,
    jersey_number: nextGenStatRecord.jersey_number,
    position: nextGenStatRecord.position,
    team: nextGenStatRecord.team,
};