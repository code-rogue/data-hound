import type { 
    RawStatData,
    PlayerData,
    BioData,
    LeagueData,
    GameData,
} from '../../../../src/interfaces/nfl/stats';
  
export const statRecord = {
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
  
export const noRawStatData: RawStatData[] = [];
export const rawStatData: RawStatData[] = [statRecord];
export const statGameData: GameData = {
    player_id: statRecord.player_id,
    season: statRecord.season,
    week: statRecord.week,
};

export const statPlayerData: PlayerData = {
    gsis_id: statRecord.gsis_id,
    full_name: statRecord.full_name,
    short_name: statRecord.short_name,
}

export const statLeagueData: LeagueData = {
    player_id: 0,
    position: statRecord.position,
    position_group: statRecord.position_group,
    team: statRecord.team,
}

export const statBioData: BioData = {
    player_id: 0,
    headshot_url: statRecord.headshot_url,
};