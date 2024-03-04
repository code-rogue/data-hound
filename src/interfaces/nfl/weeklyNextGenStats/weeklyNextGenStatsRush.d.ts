
import { RawWeeklyStatData } from '../stats';
  
export interface RawWeeklyNextGenStatRushData extends RawWeeklyStatData, NextGenRushData {}

export interface NextGenRushData {
    player_weekly_id?: number,
    efficiency:  number | null,
    attempts_gte_eight_defenders_pct: number | null,
    avg_time_to_los: number | null,
    expected_yards: number | null,
    yards_over_expected: number | null,
    avg_yards: number | null,
    yards_over_expected_per_att: number | null,
    yards_over_expected_pct: number | null,
}