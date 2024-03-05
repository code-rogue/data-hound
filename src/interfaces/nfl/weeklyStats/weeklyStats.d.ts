import { RawWeeklyStatData as StatData } from '@interfaces/nfl/stats';

export interface RawWeeklyStatData extends StatData, PassData, RushData, RecData {}

export interface PassData {
  player_weekly_id: number,
  attempts: number | null,
  completions: number | null,
  pass_yards: number | null,
  pass_yards_after_catch: number | null,
  pass_air_yards: number | null,
  pass_air_conversion_ratio: number | null,
  pass_first_downs: number | null,
  dakota: number | null,
  pass_epa: number | null,
  pass_tds: number | null,
  pass_two_pt_conversions: number | null,
  interceptions: number | null,
  sacks: number | null,
  sack_yards: number | null,
  sack_fumbles: number | null,
  sack_fumbles_lost: number | null,
}

export interface RushData {
  player_weekly_id: number,
  carries: number | null,
  rush_yards: number | null,
  rush_first_downs: number | null,
  rush_epa: number | null,
  rush_tds: number | null,
  rush_two_pt_conversions: number | null,
  rush_fumbles: number | null,
  rush_fumbles_lost: number | null,
  special_teams_tds: number | null,
}

export interface RecData {
  player_weekly_id: number,
  targets: number | null,
  receptions: number | null,
  target_share: number | null,
  rec_yards: number | null,
  rec_yards_after_catch: number | null,
  rec_air_yards: number | null,
  rec_air_yards_share: number | null,
  rec_air_conversion_ratio: number | null,
  weighted_opportunity_rating: number | null,
  rec_epa: number | null,
  rec_tds: number | null,
  rec_two_pt_conversions: number | null,
  rec_first_downs: number | null,
  rec_fumbles: number | null,
  rec_fumbles_lost: number | null,
}