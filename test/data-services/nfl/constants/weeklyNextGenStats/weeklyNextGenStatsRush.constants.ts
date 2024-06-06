import type { 
    RawWeeklyNextGenStatRushData, 
    NextGenRushData as WeeklyNextGenRushData,
  } from '@interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsRush';

export const weeklyNextGenStatRushRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    full_name: 'string',
    short_name: 'string',
    first_name: 'string',
    last_name: 'string',
    headshot_url: '',
    season: '2003',
    week: '1',
    game_type: 'REG',
    position: 'WR',
    jersey_number: '5',
    team: 'KC',
    gsis_id: 'string',
    efficiency: 3.45,
    attempts_gte_eight_defenders_pct: 16.6,
    avg_time_to_los: 2.5,
    expected_yards: 632.6,
    yards_over_expected: -18.3,
    avg_yards: 3.9,
    yards_over_expected_per_att: -0.11,
    yards_over_expected_pct: 0.375,
  };

  export const noRawWeeklyNextGenStatRushData: RawWeeklyNextGenStatRushData[] = [];
  export const rawWeeklyNextGenStatRushData: RawWeeklyNextGenStatRushData[] = [weeklyNextGenStatRushRecord];
  
  export const nextGenRushData: WeeklyNextGenRushData = {
    player_weekly_id: weeklyNextGenStatRushRecord.player_weekly_id,
    efficiency: weeklyNextGenStatRushRecord.efficiency,
    attempts_gte_eight_defenders_pct: weeklyNextGenStatRushRecord.attempts_gte_eight_defenders_pct,
    avg_time_to_los: weeklyNextGenStatRushRecord.avg_time_to_los,
    expected_yards: weeklyNextGenStatRushRecord.expected_yards,
    yards_over_expected: weeklyNextGenStatRushRecord.yards_over_expected,
    avg_yards: weeklyNextGenStatRushRecord.avg_yards,
    yards_over_expected_per_att: weeklyNextGenStatRushRecord.yards_over_expected_per_att,
    yards_over_expected_pct: weeklyNextGenStatRushRecord.yards_over_expected_pct,
  };

  export const weeklyNextGenStatsRushColumns = {
    season: "season",
    game_type: "season_type",
    week: "week",
    full_name: "player_display_name",
    position: "player_position",
    team: "team_abbr",
    efficiency: "efficiency",
    attempts_gte_eight_defenders_pct: "percent_attempts_gte_eight_defenders",
    avg_time_to_los: "avg_time_to_los",
    expected_yards: "expected_rush_yards",
    yards_over_expected: "rush_yards_over_expected",
    avg_yards: "avg_rush_yards",
    yards_over_expected_per_att: "rush_yards_over_expected_per_att",
    yards_over_expected_pct: "rush_pct_over_expected",
    gsis_id: "player_gsis_id",
    first_name: "player_first_name",
    last_name: "player_last_name",
    jersey_number: "player_jersey_number",
    short_name: "player_short_name"
  }