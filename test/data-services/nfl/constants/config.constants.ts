import { playerColumns } from './player.constants';
import { playerWeeklyStatsColumns } from './weeklyStats/weeklyStats.constants';
import { weeklyAdvStatsDefColumns } from './weeklyAdvStats/weeklyAdvStatsDef.constants';
import { weeklyAdvStatsPassColumns } from './weeklyAdvStats/weeklyAdvStatsPass.constants';
import { weeklyAdvStatsRecColumns } from './weeklyAdvStats/weeklyAdvStatsRec.constants';
import { weeklyAdvStatsRushColumns } from './weeklyAdvStats/weeklyAdvStatsRush.constants';
import { playerWeeklyStatsDefColumns } from './weeklyStats/weeklyStatsDef.constants';
import { playerWeeklyStatsKickColumns } from './weeklyStats/weeklyStatsKick.constants';
import { seasonAdvStatsPassColumns } from './seasonAdvStats/seasonAdvStatsPass.constants';
import { seasonAdvStatsRecColumns } from './seasonAdvStats/seasonAdvStatsRec.constants';
import { seasonAdvStatsRushColumns } from './seasonAdvStats/seasonAdvStatsRush.constants';
import { seasonAdvStatsDefColumns } from './seasonAdvStats/seasonAdvStatsDef.constants';

export * from './player.constants';

export * from './stats.constants';
export * from './weeklyAdvStats/weeklyAdvStats.constants';
export * from './weeklyStats/weeklyStats.constants';
export * from './weeklyStats/weeklyStatsDef.constants';
export * from './weeklyStats/weeklyStatsKick.constants';
export * from './weeklyAdvStats/weeklyAdvStatsDef.constants';
export * from './weeklyAdvStats/weeklyAdvStatsPass.constants';
export * from './weeklyAdvStats/weeklyAdvStatsRec.constants';
export * from './weeklyAdvStats/weeklyAdvStatsRush.constants';
export * from './seasonAdvStats/seasonAdvStats.constants';
export * from './seasonAdvStats/seasonAdvStatsPass.constants';
export * from './seasonAdvStats/seasonAdvStatsRec.constants';
export * from './seasonAdvStats/seasonAdvStatsRush.constants';
export * from './seasonAdvStats/seasonAdvStatsDef.constants';

export const dataFile = "Massive Data File"; 

export const configData = {
  database: {
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "statServer"
  },
  nfl: {
    players: {
      columns: playerColumns,
      urls: [
        "https://players.csv"
      ]
    },
    player_weekly_stats: {
      columns: playerWeeklyStatsColumns,
      urls: [
        "https://player_stats_2023.csv",
        "https://player_stats_2022.csv"
      ]
    },
    player_weekly_def_stats: {
      columns: playerWeeklyStatsDefColumns,
      urls: [
        "https://player_stats_def_2023.csv",
        "https://player_stats_def_2022.csv"
      ]
    },
    player_weekly_kick_stats: {
      columns: playerWeeklyStatsKickColumns,
      urls: [
        "https://player_stats_kick_2023.csv",
        "https://player_stats_kick_2022.csv",
      ]
    },
    player_weekly_adv_pass_stats: {
      columns: weeklyAdvStatsPassColumns,
      urls: [
        "https://advstats_week_pass_2023.csv",
        "https://advstats_week_pass_2022.csv",
      ]
    },
    player_weekly_adv_rush_stats: {
      columns: weeklyAdvStatsRushColumns,
      urls: [
        "https://advstats_week_rush_2023.csv",
        "https://advstats_week_rush_2022.csv",
      ]
    },
    player_weekly_adv_rec_stats: {
      columns: weeklyAdvStatsRecColumns,
      urls: [
        "https://advstats_week_rec_2023.csv",
        "https://advstats_week_rec_2022.csv",
      ]
    },
    player_weekly_adv_def_stats: {
      columns: weeklyAdvStatsDefColumns,
      urls: [
        "https://advstats_week_def_2023.csv",
        "https://advstats_week_def_2022.csv",
      ]
    },
    player_season_adv_pass_stats: {
      columns: seasonAdvStatsPassColumns,
      urls: [
        "https://advstats_season_pass_2023.csv",
        "https://advstats_season_pass_2022.csv",
      ]
    },
    player_season_adv_rec_stats: {
      columns: seasonAdvStatsRecColumns,
      urls: [
        "https://advstats_season_rec_2023.csv",
        "https://advstats_season_rec_2022.csv",
      ]
    },
    player_season_adv_rush_stats: {
      columns: seasonAdvStatsRushColumns,
      urls: [
        "https://advstats_season_rush_2023.csv",
        "https://advstats_season_rush_2022.csv",
      ]
    },
    player_season_adv_def_stats: {
      columns: seasonAdvStatsDefColumns,
      urls: [
        "https://advstats_season_def_2023.csv",
        "https://advstats_season_def_2022.csv",
      ]
    }
  }
};