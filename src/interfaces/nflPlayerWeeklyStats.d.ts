export interface RawPlayerWeeklyStatData extends PlayerGameData, PlayerData, PassData, RushData, RecData {}

export interface PlayerGameData {
    player_id: number,
    player_lookup: string,
    season: string,
    week: string,
    game_type: string,
    opponent: string,
    fantasy_points: number,
    fantasy_points_ppr: number,
}

export interface PlayerData {
    player_name: string,
    player_full_name: string,
    position: string,
    position_group: string,
    headshot_url: string,
    team: string,
}

export interface PassData {
  player_id: number,
  attempts: number,
  completions: number,
  pass_yards: number,
  yards_after_catch: number,
  air_yards: number,
  pass_air_conversion_ratio: number,
  pass_first_downs: number,
  dakota: number,
  pass_epa: number,
  pass_tds: number,
  pass_two_pt_conversions: number,
  interceptions: number,
  sacks: number,
  sack_yards: number,
  sack_fumbles: number,
  sack_fumbles_lost: number,
}

export interface RushData {
  player_id: number,
  carries: number,
  rush_yards: number,
  rush_first_downs: number,
  rush_epa: number,
  rush_tds: number,
  rush_two_pt_conversions: number,
  rush_fumbles: number,
  rush_fumbles_lost: number,
  special_teams_tds: number,
}

export interface RecData {
    player_id: number,
    targets: number,
    receptions: number,
    target_share: number,
    rec_yards: number,
    yards_after_catch: number,
    air_yards: number,
    air_yards_share: number,
    air_conversion_ratio: number,
    rec_epa: number,
    rec_tds: number,
    rec_two_pt_conversions: number,
    rec_first_downs: number,
    rec_fumbles: number,
    rec_fumbles_lost: number,
  }