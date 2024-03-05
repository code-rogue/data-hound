import { RawSeasonStatData } from '@interfaces/nfl/stats';
  
export interface RawSeasonAdvStatRushData extends RawSeasonStatData, SeasonAdvStatRushData {}

export interface SeasonAdvStatRushData {
    player_season_id?: number,
    attempts: number | null,
    yards: number | null,
    tds: number | null,
    longest_rush: number | null,
    yards_before_contact: number | null,
    yards_before_contact_avg: number | null,
    yards_after_contact: number | null,
    yards_after_contact_avg: number | null,
    broken_tackles: number | null,
    broken_tackles_avg: number | null,
}