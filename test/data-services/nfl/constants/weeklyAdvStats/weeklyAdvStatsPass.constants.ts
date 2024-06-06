import type { 
    RawWeeklyAdvStatPassData, 
    AdvPassData as WeeklyAdvPassData,
  } from '@interfaces/nfl/weeklyAdvStats/weeklyAdvStatsPass';

export const weeklyAdvStatPassRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    full_name: 'string',
    short_name: 'string',
    headshot_url: 'string',
    game_id: "2023_01_DET_KC",
    pfr_game_id: "202309070kan",
    season: "2003",
    week: '1',
    game_type: "REG",
    team: "KC",
    opponent: "DET",
    pfr_id: "string",
    pass_drops: 6,
    pass_drop_pct: 0.135,
    rec_drop: 1,
    rec_drop_pct: .04,
    bad_throws: 3,
    bad_throw_pct: 7.2,
    blitzed: 7,
    hurried: 8,
    hit: 4,
    pressured: 14,
    pressured_pct: 0.333,
  };

  export const noRawWeeklyStatPassData: RawWeeklyAdvStatPassData[] = [];
  export const rawWeeklyStatPassData: RawWeeklyAdvStatPassData[] = [weeklyAdvStatPassRecord];
  
  export const advPassData: WeeklyAdvPassData = {
    player_weekly_id: weeklyAdvStatPassRecord.player_weekly_id,
    pass_drops: weeklyAdvStatPassRecord.pass_drops,
    pass_drop_pct: weeklyAdvStatPassRecord.pass_drop_pct,
    rec_drop: weeklyAdvStatPassRecord.rec_drop,
    rec_drop_pct: weeklyAdvStatPassRecord.rec_drop_pct,
    bad_throws: weeklyAdvStatPassRecord.bad_throws,
    bad_throw_pct: weeklyAdvStatPassRecord.bad_throw_pct,
    blitzed: weeklyAdvStatPassRecord.blitzed,
    hurried: weeklyAdvStatPassRecord.hurried,
    hit: weeklyAdvStatPassRecord.hit,
    pressured: weeklyAdvStatPassRecord.pressured,
    pressured_pct: weeklyAdvStatPassRecord.pressured_pct,
  };

  export const weeklyAdvStatsPassColumns = {
    game_id: "game_id",
    pfr_game_id: "pfr_game_id",
    season: "season",
    week: "week",
    game_type: "game_type",
    team: "team",
    opponent: "opponent_team",
    full_name: "pfr_player_name",
    pfr_id: "pfr_player_id",
    pass_drops: "passing_drops",
    pass_drop_pct: "passing_drop_pct",
    rec_drop: "receiving_drop",
    rec_drop_pct: "receiving_drop_pct",
    bad_throws: "passing_bad_throws",
    bad_throw_pct: "passing_bad_throw_pct",
    blitzed: "times_blitzed",
    hurried: "times_hurried",
    hit: "times_hit",
    pressured: "times_pressured",
    pressured_pct: "times_pressured_pct",
  }