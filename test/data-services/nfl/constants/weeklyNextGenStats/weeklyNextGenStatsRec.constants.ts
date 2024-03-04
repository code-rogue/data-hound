import type { 
    RawWeeklyNextGenStatRecData, 
    NextGenRecData as WeeklyNextGenRecData,
  } from '../../../../../src/interfaces/nfl/weeklyNextGenStats/weeklyNextGenStatsRec';

export const weeklyNextGenStatRecRecord = {
    player_id: 1001,
    player_weekly_id: 100,
    full_name: 'string',
    short_name: 'string',
    first_name: 'string',
    last_name: 'string',
    headshot_url: '',
    season: "2003",
    week: 1,
    game_type: "REG",
    position: "WR",
    jersey_number: '5',
    team: "KC",
    gsis_id: "string",
    avg_cushion: 7.66,
    avg_separation: 3.68,
    avg_intended_air_yards: 8.65,
    catch_pct: 71.2,
    share_of_intended_air_yards_pct: 22.8,
    avg_yac: 5.08,
    avg_expected_yac: 4.1,
    avg_yac_above_expectation: 0.975,
  };

  export const noRawWeeklyNextGenStatRecData: RawWeeklyNextGenStatRecData[] = [];
  export const rawWeeklyNextGenStatRecData: RawWeeklyNextGenStatRecData[] = [weeklyNextGenStatRecRecord];
  
  export const nextGenRecData: WeeklyNextGenRecData = {
    player_weekly_id: weeklyNextGenStatRecRecord.player_weekly_id,
    avg_cushion: weeklyNextGenStatRecRecord.avg_cushion,
    avg_separation: weeklyNextGenStatRecRecord.avg_separation,
    avg_intended_air_yards: weeklyNextGenStatRecRecord.avg_intended_air_yards,
    catch_pct: weeklyNextGenStatRecRecord.catch_pct,
    share_of_intended_air_yards_pct: weeklyNextGenStatRecRecord.share_of_intended_air_yards_pct,
    avg_yac: weeklyNextGenStatRecRecord.avg_yac,
    avg_expected_yac: weeklyNextGenStatRecRecord.avg_expected_yac,
    avg_yac_above_expectation: weeklyNextGenStatRecRecord.avg_yac_above_expectation,
  };

  export const weeklyNextGenStatsRecColumns = {
    season: "season",
    game_type: "season_type",
    week: "week",
    full_name: "player_display_name",
    position: "player_position",
    team: "team_abbr",
    avg_cushion: "avg_cushion",
    avg_separation: "avg_separation",
    avg_intended_air_yards: "avg_intended_air_yards",
    share_of_intended_air_yards_pct: "percent_share_of_intended_air_yards",
    catch_pct: "catch_percentage",
    avg_yac: "avg_yac",
    avg_expected_yac: "avg_expected_yac",
    avg_yac_above_expectation: "avg_yac_above_expectation",
    gsis_id: "player_gsis_id",
    first_name: "player_first_name",
    last_name: "player_last_name",
    jersey_number: "player_jersey_number",
    short_name: "player_short_name"
  }