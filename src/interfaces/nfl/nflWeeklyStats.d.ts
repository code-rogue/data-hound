import { RawStatData } from './nflStats';

export interface RawWeeklyStatData extends RawStatData, PassData, RushData, RecData {}

export interface PassData {
  player_weekly_id: number,
  attempts: number,
  completions: number,
  pass_yards: number | null,
  pass_yards_after_catch: number | null,
  pass_air_yards: number | null,
  pass_air_conversion_ratio: number | null,
  pass_first_downs: number,
  dakota: number | null,
  pass_epa: number | null,
  pass_tds: number,
  pass_two_pt_conversions: number,
  interceptions: number,
  sacks: number | null,
  sack_yards: number | null,
  sack_fumbles: number,
  sack_fumbles_lost: number,
}

export interface RushData {
  player_weekly_id: number,
  carries: number,
  rush_yards: number | null,
  rush_first_downs: number,
  rush_epa: number | null,
  rush_tds: number,
  rush_two_pt_conversions: number,
  rush_fumbles: number,
  rush_fumbles_lost: number,
  special_teams_tds: number,
}

export interface RecData {
  player_weekly_id: number,
  targets: number,
  receptions: number,
  target_share: number | null,
  rec_yards: number | null,
  rec_yards_after_catch: number | null,
  rec_air_yards: number | null,
  rec_air_yards_share: number | null,
  rec_air_conversion_ratio: number | null,
  weighted_opportunity_rating: number | null,
  rec_epa: number | null,
  rec_tds: number,
  rec_two_pt_conversions: number,
  rec_first_downs: number,
  rec_fumbles: number,
  rec_fumbles_lost: number,
}