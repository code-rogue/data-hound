export interface RawPlayerData extends PlayerData, BioData, LeagueData {}

export interface PlayerData {
    career_status: string,
    game_status_abbr: string,
    game_status: string,
    esb_id: string,
    gsis_id: string,
    gsis_it_id: string,
    smart_id: string,
    full_name: string,
    first_name: string,
    last_name: string,
    short_name: string,
    suffix: string,
}

export interface BioData {
  player_id: number,
  birth_date: string | null,
  college: string,
  college_conference: string,
  height: string | null,
  weight: string | null,
  headshot_url: string,
}

export interface LeagueData {
  player_id: number,
  position_group: string,
  position: string,
  jersey_number: string | null,
  years_of_experience: string | null,
  team: string,
  team_seq: string,
  team_id: string,
  rookie_year: string,
  draft_team: string,
  draft_number: string,
  draft_round: string,
  season: string,
}