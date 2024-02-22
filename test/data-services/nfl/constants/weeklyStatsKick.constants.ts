import type { 
  GameData as WeeklyKickGameData,
} from '../../../../src/interfaces/nfl/nflStats';

import type { 
  RawWeeklyStatKickData, 
  KickData as WeeklyKickData,
} from '../../../../src/interfaces/nfl/nflWeeklyStatsKick';

export const weeklyStatKickRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    gsis_id: 'string',
    full_name: 'string',
    short_name: 'string',
    headshot_url: 'string',
    position: 'string',
    position_group: 'string',
    team: 'string',
    season: 'string',
    week: 2,
    game_type: 'season_type',
    fg_made: 4,
    fg_missed: 0,
    fg_blocked: 0,
    fg_long: 57,
    fg_att: 4,
    fg_pct: 1,
    pat_made: 2,
    pat_missed: 0,
    pat_blocked: 0,
    pat_att: 2,
    pat_pct: 1,
    fg_made_distance: 124,
    fg_missed_distance: 0,
    fg_blocked_distance: 0,
    gwfg_att: 0,
    gwfg_distance: 0,
    gwfg_made: 0,
    gwfg_missed: 0,
    gwfg_blocked: 0,
    fg_made_0_19: 0,
    fg_made_20_29: 2,
    fg_made_30_39: 0,
    fg_made_40_49: 1,
    fg_made_50_59: 1,
    fg_made_60_: 0,
    fg_missed_0_19: 0,
    fg_missed_20_29: 0,
    fg_missed_30_39: 0,
    fg_missed_40_49: 0,
    fg_missed_50_59: 0,
    fg_missed_60_: 0,
    fg_made_list: "25;28;42;57",
    fg_missed_list: "",
    fg_blocked_list: "",
  };

  export const noRawWeeklyStatKickData: RawWeeklyStatKickData[] = [];
  export const rawWeeklyStatKickData: RawWeeklyStatKickData[] = [weeklyStatKickRecord];
  
  export const weeklyKickGameData: WeeklyKickGameData = {
    player_id: weeklyStatKickRecord.player_id,
    season: weeklyStatKickRecord.season,
    week: weeklyStatKickRecord.week,
    game_type: weeklyStatKickRecord.game_type,
  }

  export const kickData: WeeklyKickData = {
    player_weekly_id: weeklyStatKickRecord.player_weekly_id,
    fg_made: weeklyStatKickRecord.fg_made,
    fg_missed: weeklyStatKickRecord.fg_missed,
    fg_blocked: weeklyStatKickRecord.fg_blocked,
    fg_long: weeklyStatKickRecord.fg_long,
    fg_att: weeklyStatKickRecord.fg_att,
    fg_pct: weeklyStatKickRecord.fg_pct,
    pat_made: weeklyStatKickRecord.pat_made,
    pat_missed: weeklyStatKickRecord.pat_missed,
    pat_blocked: weeklyStatKickRecord.pat_blocked,
    pat_att: weeklyStatKickRecord.pat_att,
    pat_pct: weeklyStatKickRecord.pat_pct,
    fg_made_distance: weeklyStatKickRecord.fg_made_distance,
    fg_missed_distance: weeklyStatKickRecord.fg_missed_distance,
    fg_blocked_distance: weeklyStatKickRecord.fg_blocked_distance,
    gwfg_att: weeklyStatKickRecord.gwfg_att,
    gwfg_distance: weeklyStatKickRecord.gwfg_distance,
    gwfg_made: weeklyStatKickRecord.gwfg_made,
    gwfg_missed: weeklyStatKickRecord.gwfg_missed,
    gwfg_blocked: weeklyStatKickRecord.gwfg_blocked,
    fg_made_0_19: weeklyStatKickRecord.fg_made_0_19,
    fg_made_20_29: weeklyStatKickRecord.fg_made_20_29,
    fg_made_30_39: weeklyStatKickRecord.fg_made_30_39,
    fg_made_40_49: weeklyStatKickRecord.fg_made_40_49,
    fg_made_50_59: weeklyStatKickRecord.fg_made_50_59,
    fg_made_60_: weeklyStatKickRecord.fg_made_60_,
    fg_missed_0_19: weeklyStatKickRecord.fg_missed_0_19,
    fg_missed_20_29: weeklyStatKickRecord.fg_missed_20_29,
    fg_missed_30_39: weeklyStatKickRecord.fg_missed_30_39,
    fg_missed_40_49: weeklyStatKickRecord.fg_missed_40_49,
    fg_missed_50_59: weeklyStatKickRecord.fg_missed_50_59,
    fg_missed_60_: weeklyStatKickRecord.fg_missed_60_,
    fg_made_list: weeklyStatKickRecord.fg_made_list,
    fg_missed_list: weeklyStatKickRecord.fg_missed_list,
    fg_blocked_list: weeklyStatKickRecord.fg_blocked_list,
  };