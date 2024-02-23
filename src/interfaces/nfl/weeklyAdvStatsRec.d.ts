
import { RawStatData } from './stats';
  
export interface RawWeeklyAdvStatRecData extends RawStatData, AdvRecData {}

export interface AdvRecData {
  player_weekly_id?: number,
  broken_tackles: number | null,
  drops: number | null,
  drop_pct: number | null,
  interceptions: number | null,
  qb_rating: number | null,
}