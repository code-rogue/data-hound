
import { RawWeeklyStatData } from '@interfaces/nfl/stats';
  
export interface RawWeeklyNextGenStatRecData extends RawWeeklyStatData, NextGenRecData {}

export interface NextGenRecData {
    player_season_id?: number,
    player_weekly_id?: number,
    avg_cushion: number | null,
    avg_separation: number | null,
    avg_intended_air_yards: number | null,
    catch_pct: number | null,
    share_of_intended_air_yards_pct: number | null,
    avg_yac: number | null,
    avg_expected_yac: number | null,
    avg_yac_above_expectation: number | null,
}