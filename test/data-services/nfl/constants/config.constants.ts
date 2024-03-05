import { playerColumns } from '@test-nfl-constants/player.constants';
import { playerWeeklyStatsColumns } from '@test-nfl-constants/weeklyStats/weeklyStats.constants';
import { weeklyAdvStatsDefColumns } from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsDef.constants';
import { weeklyAdvStatsPassColumns } from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsPass.constants';
import { weeklyAdvStatsRecColumns } from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsRec.constants';
import { weeklyAdvStatsRushColumns } from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsRush.constants';
import { playerWeeklyStatsDefColumns } from '@test-nfl-constants/weeklyStats/weeklyStatsDef.constants';
import { playerWeeklyStatsKickColumns } from '@test-nfl-constants/weeklyStats/weeklyStatsKick.constants';
import { seasonAdvStatsPassColumns } from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsPass.constants';
import { seasonAdvStatsRecColumns } from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsRec.constants';
import { seasonAdvStatsRushColumns } from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsRush.constants';
import { seasonAdvStatsDefColumns } from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsDef.constants';
import { weeklyNextGenStatsPassColumns } from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStatsPass.constants';
import { weeklyNextGenStatsRecColumns } from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStatsRec.constants';
import { weeklyNextGenStatsRushColumns } from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStatsRush.constants';


export * from '@test-nfl-constants/player.constants';

export * from '@test-nfl-constants/stats.constants';
export * from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStats.constants';
export * from '@test-nfl-constants/weeklyStats/weeklyStats.constants';
export * from '@test-nfl-constants/weeklyStats/weeklyStatsDef.constants';
export * from '@test-nfl-constants/weeklyStats/weeklyStatsKick.constants';
export * from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsDef.constants';
export * from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsPass.constants';
export * from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsRec.constants';
export * from '@test-nfl-constants/weeklyAdvStats/weeklyAdvStatsRush.constants';
export * from '@test-nfl-constants/seasonAdvStats/seasonAdvStats.constants';
export * from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsPass.constants';
export * from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsRec.constants';
export * from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsRush.constants';
export * from '@test-nfl-constants/seasonAdvStats/seasonAdvStatsDef.constants';
export * from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStats.constants';
export * from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStatsPass.constants';
export * from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStatsRec.constants';
export * from '@test-nfl-constants/weeklyNextGenStats/weeklyNextGenStatsRush.constants';

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
    },
    player_weekly_nextgen_pass_stats: {
      columns: weeklyNextGenStatsPassColumns,
      urls: [
        "https://ngs_2023_passing.csv.gz",
        "https://ngs_2022_passing.csv.gz",
      ]
    },
    player_weekly_nextgen_rush_stats: {
      columns: weeklyNextGenStatsRushColumns,
      urls: [
        "https://ngs_2023_rushing.csv.gz",
        "https://ngs_2022_rushing.csv.gz",
      ]
    },
    player_weekly_nextgen_rec_stats: {
      columns: weeklyNextGenStatsRecColumns,
      urls: [
        "https://ngs_2023_receiving.csv.gz",
        "https://ngs_2022_receiving.csv.gz",
      ]
    },
  }
};