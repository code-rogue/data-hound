export interface RawStatData extends PlayerData, BioData, LeagueData, GameData {}
  
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
    fantasy_points?: number,
    fantasy_points_ppr?: number,
  }