export interface RawStatData extends PlayerData, LeagueData {}
export interface RawWeeklyStatData extends RawStatData, BioData, GameData {}
export interface RawSeasonStatData extends RawStatData, SeasonData {}
  
export interface PlayerData {
    gsis_id?: string,
    pfr_id?: string,
    full_name?: string,
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
    jersey_number?: string,
    team?: string,
    team_id?: number | null,
}

export interface GameData {
    game_id?: string,
    pfr_game_id?: string,
    player_id?: number,
    season: string,
    week: string,
    game_type?: string,
    opponent?: string,
    opponent_id?: number | null,
    team?: string,
    team_id?: number | null,
    fantasy_points?: number | null,
    fantasy_points_ppr?: number | null,
}

export interface SeasonData {
    player_id?: number,
    season: string,
    age?: number,
    games_played?: number,
    games_started?: number,
    team?: string,
    team_id?: number | null,
}

export interface UnmatchedPlayerData {
    id?: number,
    esb_id?: string,
    gsis_id?: string,
    gsis_it_id?: string,
    smart_id?: string,
    pfr_id?: string,
    full_name?: string,
    stat_service: string,
    season?: string,
    week?: string,
    team_id?: number | null,
}