export interface NFLSeasonAdvStatsPass {
    columns: {
        pfr_id: string,
        season: string,
        full_name: string,
        team: string,
        attempts: string,
        throw_aways: string,
        spikes: string,
        drops: string,
        drop_pct: string,
        bad_throws: string,
        bad_throw_pct: string,
        pocket_time: string,
        blitzed: string,
        hurried: string,
        hit: string,
        pressured: string,
        pressured_pct: string,
        batted_balls: string,
        on_tgt_throws: string,
        on_tgt_throws_pct: string,
        rpo_plays: string,
        rpo_yards: string,
        rpo_pass_attempts: string,
        rpo_pass_yards: string,
        rpo_rush_attempts: string,
        rpo_rush_yards: string,
        pa_pass_attempts: string,
        pa_pass_yards: string,
    },
    urls: string[],
}

export interface NFLSeasonAdvStatsRush {
    columns: {
        pfr_id: string,
        season: string,
        full_name: string,
        team: string,
        age: string,
        position: string,
        games_played: string,
        games_started: string,
        attempts: string,
        yards: string,
        tds: string,
        longest_rush: string,
        yards_before_contact: string,
        yards_before_contact_avg: string,
        yards_after_contact: string,
        yards_after_contact_avg: string,
        broken_tackles: string,
        broken_tackles_avg: string,
    },
    urls: string[],
}

export interface NFLSeasonAdvStatsRec {
    columns: {
        pfr_id: string,
        season: string,
        full_name: string,
        team: string,
        age: string,
        position: string,
        games_played: string,
        games_started: string,
        targets: string,
        receptions: string,
        yards: string,
        tds: string,
        longest_rec: string,
        air_yards: string,
        air_yards_avg: string,
        yards_after_contact: string,
        yards_after_contact_avg: string,
        adot: string,
        broken_tackles: string,
        broken_tackles_avg: string,
        drops: string,
        drop_pct: string,
        interceptions: string,
        qb_rating: string,
    },
    urls: string[],
}

export interface NFLSeasonAdvStatsDef {
    columns: {
        pfr_id: string,
        season: string,
        full_name: string,
        team: string,
        age: string,
        position: string,
        games_played: string,
        games_started: string,
        interceptions: string,
        targets: string,
        completions_allowed: string,
        completion_pct: string,
        yards_allowed: string,
        yards_allowed_per_cmp: string,
        yards_allowed_per_tgt: string,
        tds_allowed: string,
        passer_rating_allowed: string,
        adot: string,
        air_yards_completed: string,
        yards_after_catch: string,
        blitzed: string,
        hurried: string,
        qbkd: string,
        sacks: string,
        pressures: string,
        tackles_combined: string,
        tackles_missed: string,
        tackles_missed_pct: string,      
    },
    urls: string[],
}