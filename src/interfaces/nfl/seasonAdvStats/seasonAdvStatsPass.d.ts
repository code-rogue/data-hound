
import { RawSeasonStatData } from '@interfaces/nfl/stats';
  
export interface RawSeasonAdvStatPassData extends RawSeasonStatData, SeasonAdvStatPassData {}

export interface SeasonAdvStatPassData {
    player_season_id?: number,
    attempts: number | null,
    throw_aways: number | null,
    spikes: number | null,
    drops: number | null,
    drop_pct: number | null,
    bad_throws: number | null,
    bad_throw_pct: number | null,
    pocket_time: number | null,
    blitzed: number | null,
    hurried: number | null,
    hit: number | null,
    pressured: number | null,
    pressured_pct: number | null,
    batted_balls: number | null,
    on_tgt_throws: number | null,
    on_tgt_throws_pct: number | null,
    rpo_plays: number | null,
    rpo_yards: number | null,
    rpo_pass_attempts: number | null,
    rpo_pass_yards: number | null,
    rpo_rush_attempts: number | null,
    rpo_rush_yards: number | null,
    pa_pass_attempts: number | null,
    pa_pass_yards: number | null,
}