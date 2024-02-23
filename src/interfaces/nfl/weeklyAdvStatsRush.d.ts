
import { RawStatData } from './stats';
  
export interface RawWeeklyAdvStatRushData extends RawStatData, AdvRushData {}

export interface AdvRushData {
  player_weekly_id?: number,
  yards_before_contact: number | null,
  yards_before_contact_avg: number | null,
  yards_after_contact: number | null,
  yards_after_contact_avg: number | null,
  broken_tackles: number | null,
}