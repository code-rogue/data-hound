export interface RawStatData extends PlayerData, LeagueData {}
export interface RawWeeklyStatData extends RawStatData, BioData, GameData {}
export interface RawSeasonStatData extends RawStatData, SeasonData {}
  
export interface PlayerData {
    gsis_id?: string,
    pfr_id?: string,
    full_name: string,
    short_name?: string,
    first_name?: string,
    last_name?: string,
}

export interface BioData {
    player_id?: number,
    headshot_url: string,
}

export interface LeagueData {
    player_id?: number,
    position?: string,
    position_group?: string,
    team: string,
}

export interface GameData {
    game_id?: string,
    pfr_game_id?: string,
    player_id?: number,
    season: string,
    week: number,
    game_type?: string,
    opponent?: string,
    fantasy_points?: number | null,
    fantasy_points_ppr?: number | null,
}

export interface SeasonData {
    player_id?: number,
    season: string,
    age?: number,
    games_played?: number,
    games_started?: number,
}