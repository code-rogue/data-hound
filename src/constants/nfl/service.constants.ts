export const NFLSchema = 'nfl'

export const BioTable = 'player_bio';
export const LeagueTable = 'player_league';
export const PlayerTable = 'players';
export const SeasonAdvDefTable = 'season_adv_stats_def';
export const SeasonAdvPassTable = 'season_adv_stats_pass';
export const SeasonAdvRecTable = 'season_adv_stats_rec';
export const SeasonAdvRushTable = 'season_adv_stats_rush';
export const SeasonDefTable = 'season_stats_def';
export const SeasonKickTable = 'season_stats_kick';
export const SeasonNextGenPassTable = 'season_nextgen_stats_pass';
export const SeasonNextGenRecTable = 'season_nextgen_stats_rec';
export const SeasonNextGenRushTable = 'season_nextgen_stats_rush';
export const SeasonPassTable = 'season_stats_pass';
export const SeasonRecTable = 'season_stats_rec';
export const SeasonRushTable = 'season_stats_rush';
export const SeasonStatTable = 'player_season_stats';
export const WeeklyDefTable = 'weekly_stats_def';
export const WeeklyKickTable = 'weekly_stats_kick';
export const WeeklyPassTable = 'weekly_stats_pass';
export const WeeklyRecTable = 'weekly_stats_rec';
export const WeeklyRushTable = 'weekly_stats_rush';
export const WeeklyAdvDefTable = 'weekly_adv_stats_def';
export const WeeklyAdvPassTable = 'weekly_adv_stats_pass';
export const WeeklyAdvRecTable = 'weekly_adv_stats_rec';
export const WeeklyAdvRushTable = 'weekly_adv_stats_rush';
export const WeeklyNextGenPassTable = 'weekly_nextgen_stats_pass';
export const WeeklyNextGenRecTable = 'weekly_nextgen_stats_rec';
export const WeeklyNextGenRushTable = 'weekly_nextgen_stats_rush';
export const WeeklyStatTable = 'player_weekly_stats';

export const PlayerFullName = 'full_name';
export const PlayerPFR = 'pfr_id';
export const PlayerId = 'player_id';
export const PlayerGSIS = 'gsis_id';
export const PlayerSmartId = "smart_id";
export const SeasonStatId = 'player_season_id';
export const WeeklyStatId = 'player_weekly_id';

// Procedures
export const CalcSeasonStats = 'calc_season_stats';
export const CalcSeasonDefStats = 'calc_season_def_stats';
export const CalcSeasonKickStats = 'calc_season_kick_stats';
export const CalcSeasonPassStats = 'calc_season_pass_stats';
export const CalcSeasonRecStats = 'calc_season_rec_stats';
export const CalcSeasonRushStats = 'calc_season_rush_stats';
export const CalcSeasonNextGenPassStats = 'calc_season_nextgen_pass_stats';
export const CalcSeasonNextGenRecStats = 'calc_season_nextgen_rec_stats';
export const CalcSeasonNextGenRushStats = 'calc_season_nextgen_rush_stats';
export const CleanPlayerData = 'clean_player_data';

export enum ServiceName {
    CSVService = 'CSV Service',
    DBService = 'DB Service',
    NFLPlayerService = 'NFL Player Service',
    NFLSeasonAdvStatService = 'NFL Season Adv Stats Service',
    NFLSeasonAdvStatPassService = 'NFL Season Adv Pass Stats Service',
    NFLSeasonAdvStatRecService = 'NFL Season Adv REc Stats Service',
    NFLSeasonAdvStatRushService = 'NFL Season Adv Rush Stats Service',
    NFLSeasonAdvStatDefService = 'NFL Season Adv Def Stats Service',
    NFLStatService = 'NFL Stats Service',
    NFLWeeklyStatService = 'NFL Weekly Stats Service',
    NFLWeeklyStatOffService = 'NFL Weekly Offensive Stats Service',
    NFLWeeklyStatDefService = 'NFL Weekly Def Stats Service',
    NFLWeeklyStatKickService = 'NFL Weekly Kick Stats Service',
    NFLWeeklyAdvStatService = 'NFL Weekly Adv Stats Service',
    NFLWeeklyAdvStatPassService = 'NFL Weekly Adv Pass Stats Service',
    NFLWeeklyAdvStatRecService = 'NFL Weekly Adv Rec Stats Service',
    NFLWeeklyAdvStatRushService = 'NFL Weekly Adv Rush Stats Service',
    NFLWeeklyAdvStatDefService = 'NFL Weekly Adv Def Stats Service',
    NFLWeeklyNextGenStatService = 'NFL Weekly Next Gen Stats Service',
    NFLWeeklyNextGenStatPassService = 'NFL Weekly Next Gen Stats Pass Service',
    NFLWeeklyNextGenStatRecService = 'NFL Weekly Next Gen Stat Rec Service',
    NFLWeeklyNextGenStatRushService = 'NFL Weekly Next Gen Stat Rush Service',
}
