export interface Config {
    nfl: {
        players: {
          columns: {
            // player table
            career_status: string,
            game_status_abbr: string,
            game_status: string,
            esb_id: string,
            gsis_id: string,
            gsis_it_id: string,
            smart_id: string,
            first_name: string,
            last_name: string,
            full_name: string,
            short_name: string,
            suffix: string,
            // player bio table
            birth_date: string,
            college_name: string,
            college_conference: string,
            height: string,
            weight: string,
            headshot_url: string,
            // player league table
            position_group: string,
            position: string,
            jersey_number: string,
            years_of_experience: string,
            team: string,
            team_seq: string,
            team_id: string,
            football_name: string,
            entry_year: string,
            rookie_year: string,
            draft_team: string,
            draft_number: string,
            uniform_number: string,
            draft_round: string,
            season: string,
          },
          url: string,
        },
    },
    database: {
      username: string,
      host: string,
      database: string,
      password: string,
      port: number,
    }
  }