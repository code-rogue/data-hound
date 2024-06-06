
import { RawWeeklyStatData } from '@interfaces/nfl/stats';
  
export interface RawWeeklyNextGenStatPassData extends RawWeeklyStatData, NextGenPassData {}

export interface NextGenPassData {
    player_season_id?: number,
    player_weekly_id?: number,    
    avg_time_to_throw: number | null,
    avg_completed_air_yards: number | null,
    avg_intended_air_yards: number | null,
    avg_air_yards_differential: number | null,
    aggressiveness: number | null,
    max_completed_air_distance: number | null,
    avg_air_yards_to_sticks: number | null,
    passer_rating: number | null,
    completion_pct: number | null,
    expected_completion_pct: number | null,
    completions_above_expectation_pct: number | null,
    avg_air_distance: number | null,
    max_air_distance: number | null,
}