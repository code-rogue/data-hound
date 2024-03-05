import type { 
    RawWeeklyAdvStatRushData, 
    AdvRushData as WeeklyAdvRushData,
  } from '@interfaces/nfl/weeklyAdvStats/weeklyAdvStatsRush';

export const weeklyAdvStatRushRecord = {
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
    yards_before_contact: 6,
    yards_before_contact_avg: 1.135,
    yards_after_contact: 10,
    yards_after_contact_avg: 2.3,
    broken_tackles: 3,
  };

  export const noRawWeeklyStatRushData: RawWeeklyAdvStatRushData[] = [];
  export const rawWeeklyStatRushData: RawWeeklyAdvStatRushData[] = [weeklyAdvStatRushRecord];
  
  export const advRushData: WeeklyAdvRushData = {
    player_weekly_id: weeklyAdvStatRushRecord.player_weekly_id,
    yards_before_contact: weeklyAdvStatRushRecord.yards_before_contact,
    yards_before_contact_avg: weeklyAdvStatRushRecord.yards_before_contact_avg,
    yards_after_contact: weeklyAdvStatRushRecord.yards_after_contact,
    yards_after_contact_avg: weeklyAdvStatRushRecord.yards_after_contact_avg,
    broken_tackles: weeklyAdvStatRushRecord.broken_tackles,
  };

  export const weeklyAdvStatsRushColumns = {
    game_id: "game_id",
    pfr_game_id: "pfr_game_id",
    season: "season",
    week: "week",
    game_type: "game_type",
    team: "team",
    opponent: "opponent_team",
    full_name: "pfr_player_name",
    pfr_id: "pfr_player_id",
    yards_before_contact: "rushing_yards_before_contact",
    yards_before_contact_avg: "rushing_yards_before_contact_avg",
    yards_after_contact: "rushing_yards_after_contact",
    yards_after_contact_avg: "rushing_yards_after_contact_avg",
    broken_tackles: "rushing_broken_tackles",
  };