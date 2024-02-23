
  import { RawStatData } from './stats';
  
  export interface RawWeeklyStatDefData extends RawStatData, DefData {}
  
  export interface DefData {
    player_weekly_id?: number,
    tackles: number,
    tackles_solo: number,
    tackle_with_assists: number,
    tackle_assists: number,
    tackles_for_loss: number,
    tackles_for_loss_yards: number,
    fumbles_forced: number,
    sacks: number,
    sack_yards: number,
    qb_hits: number,
    interceptions: number,
    interception_yards: number,
    pass_defended: number,
    tds: number,
    fumbles: number,
    fumble_recovery_own: number,
    fumble_recovery_yards_own: number,
    fumble_recovery_opp: number,
    fumble_recovery_yards_opp: number,
    safety: number,
    penalty: number,
    penalty_yards: number,
  }