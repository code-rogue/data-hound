
import { RawSeasonStatData } from '../stats';
  
export interface RawSeasonAdvStatDefData extends RawSeasonStatData, SeasonAdvStatDefData {}

export interface SeasonAdvStatDefData {
    player_season_id?: number,
    interceptions: number | null,
    targets: number | null,
    completions_allowed: number | null,
    completion_pct: number | null,
    yards_allowed: number | null,
    yards_allowed_per_cmp: number | null,
    yards_allowed_per_tgt: number | null,
    tds_allowed: number | null,
    passer_rating_allowed: number | null,
    adot: number | null,
    air_yards_completed: number | null,
    yards_after_catch: number | null,
    blitzed: number | null,
    hurried: number | null,
    qbkd: number | null,
    sacks: number | null,
    pressures: number | null,
    tackles_combined: number | null,
    tackles_missed: number | null,
    tackles_missed_pct: number | null,
  }