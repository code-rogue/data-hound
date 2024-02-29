
import { RawWeeklyStatData } from '../stats';
  
export interface RawWeeklyAdvStatPassData extends RawWeeklyStatData, AdvPassData {}

export interface AdvPassData {
  player_weekly_id?: number,
  pass_drops: number | null,
  pass_drop_pct: number | null,
  rec_drop: number | null,
  rec_drop_pct: number | null,
  bad_throws: number | null,
  bad_throw_pct: number | null,
  blitzed: number | null,
  hurried: number | null,
  hit: number | null,
  pressured: number | null,
  pressured_pct: number | null,
}