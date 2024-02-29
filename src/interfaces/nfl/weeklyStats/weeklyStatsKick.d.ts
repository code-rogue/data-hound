import { RawWeeklyStatData } from '../stats';

export interface RawWeeklyStatKickData extends RawWeeklyStatData, WeeklyKickData {}

export interface WeeklyKickData {
    player_weekly_id: number,
    fg_made: number | null,
    fg_missed: number | null,
    fg_blocked: number | null,
    fg_long: number | null,
    fg_att: number | null,
    fg_pct: number | null,
    pat_made: number | null,
    pat_missed: number | null,
    pat_blocked: number | null,
    pat_att: number | null,
    pat_pct: number | null,
    fg_made_distance: number | null,
    fg_missed_distance: number | null,
    fg_blocked_distance: number | null,
    gwfg_att: number | null,
    gwfg_distance: number | null,
    gwfg_made: number | null,
    gwfg_missed: number | null,
    gwfg_blocked: number | null,
    fg_made_0_19: number | null,
    fg_made_20_29: number | null,
    fg_made_30_39: number | null,
    fg_made_40_49: number | null,
    fg_made_50_59: number | null,
    fg_made_60_: number | null,
    fg_missed_0_19: number | null,
    fg_missed_20_29: number | null,
    fg_missed_30_39: number | null,
    fg_missed_40_49: number | null,
    fg_missed_50_59: number | null,
    fg_missed_60_: number | null,
    fg_made_list: string,
    fg_missed_list: string,
    fg_blocked_list: string,
}