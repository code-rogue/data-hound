import { nflPlayers } from './nfl/player';
import { 
  NFLWeeklyStats, 
  NFLWeeklyStatsDef, 
  NFLWeeklyStatsKick
} from './nfl/weeklyStats';
import { 
  NFLSeasonAdvStatsPass, 
  NFLSeasonAdvStatsRush, 
  NFLSeasonAdvStatsRec,
  NFLSeasonAdvStatsDef,
} from './nfl/seasonAdvStats';
import { 
  NFLWeeklyAdvStatsPass, 
  NFLWeeklyAdvStatsRush, 
  NFLWeeklyAdvStatsRec,
  NFLWeeklyAdvStatsDef,
} from './nfl/weeklyAdvStats';

export interface Config {
    nfl: {
        players: nflPlayers;
        player_weekly_stats: NFLWeeklyStats,
        player_weekly_def_stats: NFLWeeklyStatsDef,
        player_weekly_kick_stats: NFLWeeklyStatsKick,
        player_weekly_adv_pass_stats: NFLWeeklyAdvStatsPass,
        player_weekly_adv_rush_stats: NFLWeeklyAdvStatsRush,
        player_weekly_adv_rec_stats: NFLWeeklyAdvStatsRec,
        player_weekly_adv_def_stats: NFLWeeklyAdvStatsDef,
        player_season_adv_pass_stats: NFLSeasonAdvStatsPass,
        player_season_adv_rush_stats: NFLSeasonAdvStatsRush,
        player_season_adv_rec_stats: NFLSeasonAdvStatsRec,
        player_season_adv_def_stats: NFLSeasonAdvStatsDef,
    },
    database: {
      username: string,
      host: string,
      database: string,
      password: string,
      port: number,
    }
  }