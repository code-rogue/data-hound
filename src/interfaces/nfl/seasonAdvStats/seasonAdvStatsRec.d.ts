
import { RawSeasonStatData } from '../stats';
  
export interface RawSeasonAdvStatRecData extends RawSeasonStatData, SeasonAdvStatRecData {}

export interface SeasonAdvStatRecData {
    player_season_id?: number,
    targets: number | null,
    receptions: number | null,
    yards: number | null,
    tds: number | null,
    longest_rec: number | null,
    air_yards: number | null,
    air_yards_avg: number | null,
    yards_after_contact: number | null,
    yards_after_contact_avg: number | null,
    adot: number | null,
    broken_tackles: number | null,
    broken_tackles_avg: number | null,
    drops: number | null,
    drop_pct: number | null,
    interceptions: number | null,
    qb_rating: number | null,
}