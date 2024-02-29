import type { 
  RawSeasonAdvStatRushData, 
  SeasonAdvStatRushData,
} from '../../../../../src/interfaces/nfl/seasonAdvStats/seasonAdvStatsRush';
    
export const seasonAdvStatRushRecord = {
  player_id: 1001,
  player_season_id: 100,
  full_name: 'string',
  short_name: 'string',
  season: "2003",
  team: "KC",
  pfr_id: "ABC",
  age: 23,
  games_played: 16,
  games_started: 14,
  attempts: 345,
  yards: 1605,
  tds: 11,
  longest_rush: 67,
  yards_before_contact: 230,
  yards_before_contact_avg: 8.8,
  yards_after_contact: 230,
  yards_after_contact_avg: 8.8,
  broken_tackles: 22,
  broken_tackles_avg: 28,
};
  
export const noRawSeasonStatRushData: RawSeasonAdvStatRushData[] = [];
export const rawSeasonStatRushData: RawSeasonAdvStatRushData[] = [seasonAdvStatRushRecord];

export const seasonAdvRushData: SeasonAdvStatRushData = {
  player_season_id: seasonAdvStatRushRecord.player_season_id,
  attempts: seasonAdvStatRushRecord.attempts,
  yards: seasonAdvStatRushRecord.yards,
  tds: seasonAdvStatRushRecord.tds,
  longest_rush: seasonAdvStatRushRecord.longest_rush,
  yards_before_contact: seasonAdvStatRushRecord.yards_before_contact,
  yards_before_contact_avg: seasonAdvStatRushRecord.yards_before_contact_avg,
  yards_after_contact: seasonAdvStatRushRecord.yards_after_contact,
  yards_after_contact_avg: seasonAdvStatRushRecord.yards_after_contact_avg,
  broken_tackles: seasonAdvStatRushRecord.broken_tackles,
  broken_tackles_avg: seasonAdvStatRushRecord.broken_tackles_avg,
};
  
export const seasonAdvStatsRushColumns = {
    "season": "season",
    "full_name": "player",
    "pfr_id": "pfr_id",
    "team": "team",
    "age": "age",
    "position": "position",
    "games_played": "g",
    "games_started": "gs",
    "attempts": "att",
    "yards": "yds",
    "tds": "td",
    "longest_rush": "x1d",
    "yards_before_contact": "ybc",
    "yards_before_contact_avg": "ybc_att",
    "yards_after_contact": "yac",
    "yards_after_contact_avg": "yac_att",
    "broken_tackles": "brk_tkl",
    "broken_tackles_avg": "att_br",
    "loaded": ""
};