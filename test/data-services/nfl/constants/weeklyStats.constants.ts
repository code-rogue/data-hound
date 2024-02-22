import type { 
  PlayerData as WeeklyPlayerData,
  BioData as WeeklyBioData,
  LeagueData as WeeklyLeagueData,
  GameData as WeeklyGameData,
} from '../../../../src/interfaces/nfl/nflStats';

import type { 
    RawWeeklyStatData, 
    PassData as WeeklyPassData,
    RushData as WeeklyRushData,
    RecData as WeeklyRecData,
  } from '../../../../src/interfaces/nfl/nflWeeklyStats';

export const weeklyStatRecord = {
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
    game_type: 'string',
    opponent: 'string',
    fantasy_points: 10.2,
    fantasy_points_ppr: 15.2,
    attempts: 22,
    completions: 20,
    pass_yards: 248,
    pass_yards_after_catch: 147,
    pass_air_yards: 105,
    pass_air_conversion_ratio: .284,
    pass_first_downs: 12,
    dakota: 0,
    pass_epa: 0.4,
    pass_tds: 2,
    pass_two_pt_conversions: 0,
    interceptions: 1,
    sacks: 2,
    sack_yards: 8,
    sack_fumbles: 0,
    sack_fumbles_lost: 0,
    carries: 2,
    rush_yards: -2,
    rush_first_downs: 0,
    rush_epa: 0.35,
    rush_tds: 0,
    rush_two_pt_conversions: 0,
    rush_fumbles: 0,
    rush_fumbles_lost: 0,
    special_teams_tds: 0,
    targets: 0,
    receptions: 0,
    target_share: 0,
    rec_yards: 0,
    rec_yards_after_catch: 0,
    rec_air_yards: 0,
    rec_air_yards_share: 0,
    rec_air_conversion_ratio: 0,
    weighted_opportunity_rating: 0,
    rec_epa: 0,
    rec_tds: 0,
    rec_two_pt_conversions: 0,
    rec_first_downs: 0,
    rec_fumbles: 0,
    rec_fumbles_lost: 0,
  };

  export const noRawWeeklyStatData: RawWeeklyStatData[] = [];
  export const rawWeeklyStatData: RawWeeklyStatData[] = [weeklyStatRecord];
  export const weeklyGameData: WeeklyGameData = {
    player_id: weeklyStatRecord.player_id,
    season: weeklyStatRecord.season,
    week: weeklyStatRecord.week,
    game_type: weeklyStatRecord.game_type,
    opponent: weeklyStatRecord.opponent,
    fantasy_points: weeklyStatRecord.fantasy_points,
    fantasy_points_ppr: weeklyStatRecord.fantasy_points_ppr,
  };

  export const weeklyPlayerData: WeeklyPlayerData = {
    gsis_id: weeklyStatRecord.gsis_id,
    full_name: weeklyStatRecord.full_name,
    short_name: weeklyStatRecord.short_name,
  }

  export const weeklyLeagueData: WeeklyLeagueData = {
    player_id: 0,
    position: weeklyStatRecord.position,
    position_group: weeklyStatRecord.position_group,
    team: weeklyStatRecord.team,
  }
  
  export const weeklyBioData: WeeklyBioData = {
    player_id: 0,
    headshot_url: weeklyStatRecord.headshot_url,
  };

  export const passData: WeeklyPassData = {
    player_weekly_id: weeklyStatRecord.player_weekly_id,
    attempts: weeklyStatRecord.attempts,
    completions: weeklyStatRecord.completions,
    pass_yards: weeklyStatRecord.pass_air_yards,
    pass_yards_after_catch: weeklyStatRecord.pass_yards_after_catch,
    pass_air_yards: weeklyStatRecord.pass_air_yards,
    pass_air_conversion_ratio: weeklyStatRecord.pass_air_conversion_ratio,
    pass_first_downs: weeklyStatRecord.pass_first_downs,
    dakota: weeklyStatRecord.dakota,
    pass_epa: weeklyStatRecord.pass_epa,
    pass_tds: weeklyStatRecord.pass_tds,
    pass_two_pt_conversions: weeklyStatRecord.pass_two_pt_conversions,
    interceptions: weeklyStatRecord.interceptions,
    sacks: weeklyStatRecord.sacks,
    sack_yards: weeklyStatRecord.sack_yards,
    sack_fumbles: weeklyStatRecord.sack_fumbles,
    sack_fumbles_lost: weeklyStatRecord.sack_fumbles_lost,
  };
  
  export const rushData: WeeklyRushData = {
    player_weekly_id: weeklyStatRecord.player_weekly_id,
    carries: weeklyStatRecord.carries,
    rush_yards: weeklyStatRecord.rush_yards,
    rush_first_downs: weeklyStatRecord.rush_first_downs,
    rush_epa: weeklyStatRecord.rush_epa,
    rush_tds: weeklyStatRecord.rush_tds,
    rush_two_pt_conversions: weeklyStatRecord.rush_two_pt_conversions,
    rush_fumbles: weeklyStatRecord.rush_fumbles,
    rush_fumbles_lost: weeklyStatRecord.rush_fumbles_lost,
    special_teams_tds: weeklyStatRecord.special_teams_tds,
  };
  
  export const recData: WeeklyRecData = {
    player_weekly_id: weeklyStatRecord.player_weekly_id,
    targets: weeklyStatRecord.targets,
    receptions: weeklyStatRecord.receptions,
    target_share: weeklyStatRecord.target_share,
    rec_yards: weeklyStatRecord.rec_yards,
    rec_yards_after_catch: weeklyStatRecord.rec_yards_after_catch,
    rec_air_yards: weeklyStatRecord.rec_air_yards,
    rec_air_yards_share: weeklyStatRecord.rec_air_yards_share,
    rec_air_conversion_ratio: weeklyStatRecord.rec_air_conversion_ratio,
    weighted_opportunity_rating: weeklyStatRecord.weighted_opportunity_rating,
    rec_epa: weeklyStatRecord.rec_epa,
    rec_tds: weeklyStatRecord.rec_tds,
    rec_two_pt_conversions: weeklyStatRecord.rec_two_pt_conversions,
    rec_first_downs: weeklyStatRecord.rec_first_downs,
    rec_fumbles: weeklyStatRecord.rec_fumbles,
    rec_fumbles_lost: weeklyStatRecord.rec_fumbles_lost,
  };