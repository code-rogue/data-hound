export interface NFLWeeklyAdvStatsPass {
    columns: {
      game_id: string,
      pfr_game_id: string,
      season: string,
      week: string,
      game_type: string,
      team: string,
      opponent: string,
      full_name: string,
      pfr_id: string,
      pass_drops: string,
      pass_drop_pct: string,
      rec_drop: string,
      rec_drop_pct: string,
      bad_throws: string,
      bad_throw_pct: string,
      blitzed: string,
      hurried: string,
      hit: string,
      pressured: string,
      pressured_pct: string,
    },
    urls: string[],
}

export interface NFLWeeklyAdvStatsRush {
    columns: {
      game_id: string,
      pfr_game_id: string,
      season: string,
      week: string,
      game_type: string,
      team: string,
      opponent: string,
      full_name: string,
      pfr_id: string,
      yards_before_contact: string,
      yards_before_contact_avg: string,
      yards_after_contact: string,
      yards_after_contact_avg: string,
      broken_tackles: string,
    },
    urls: string[],
}

export interface NFLWeeklyAdvStatsRec {
    columns: {
      game_id: string,
      pfr_game_id: string,
      season: string,
      week: string,
      game_type: string,
      team: string,
      opponent: string,
      full_name: string,
      pfr_id: string,
      broken_tackles: string,
      drops: string,
      drop_pct: string,
      interceptions: string,
      qb_rating: string,
    },
    urls: string[],
}

export interface NFLWeeklyAdvStatsDef {
    columns: {
      game_id: string,
      pfr_game_id: string,
      season: string,
      week: string,
      game_type: string,
      team: string,
      opponent: string,
      full_name: string,
      pfr_id: string,
      interceptions: string,
      targets: string,
      completions_allowed: string,
      completion_pct: string,
      yards_allowed: string,
      yards_allowed_per_cmp: string,
      yards_allowed_per_tgt: string,
      rec_td_allowed: string,
      passer_rating_allowed: string,
      adot: string,
      air_yards_completed: string,
      yards_after_catch: string,
      blitzed: string,
      hurried: string,
      pressures: string,
      tackles_combined: string,
      tackles_missed: string,
      tackles_missed_pct: string,
    },
    urls: string[],
}