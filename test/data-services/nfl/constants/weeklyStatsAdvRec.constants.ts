import type { 
    RawWeeklyAdvStatRecData, 
    AdvRecData as WeeklyAdvRecData,
  } from '../../../../src/interfaces/nfl/weeklyAdvStatsRec';

export const weeklyAdvStatRecRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    full_name: 'string',
    short_name: 'string',
    headshot_url: 'string',
    game_id: "2023_01_DET_KC",
    pfr_game_id: "202309070kan",
    season: "2003",
    week: 1,
    game_type: "REG",
    team: "KC",
    opponent: "DET",
    pfr_id: "string",
    broken_tackles: 6,
    drops: 4,
    drop_pct: 0.635,
    interceptions: 1,
    qb_rating: 89.3,
  };

  export const noRawWeeklyStatRecData: RawWeeklyAdvStatRecData[] = [];
  export const rawWeeklyStatRecData: RawWeeklyAdvStatRecData[] = [weeklyAdvStatRecRecord];
  
  export const advRecData: WeeklyAdvRecData = {
    player_weekly_id: weeklyAdvStatRecRecord.player_weekly_id,
    broken_tackles: weeklyAdvStatRecRecord.broken_tackles,
    drops: weeklyAdvStatRecRecord.drops,
    drop_pct: weeklyAdvStatRecRecord.drop_pct,
    interceptions: weeklyAdvStatRecRecord.interceptions,
    qb_rating: weeklyAdvStatRecRecord.qb_rating,
  };