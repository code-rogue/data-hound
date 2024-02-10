import type { 
    RawPlayerData, 
    PlayerData,
    BioData,
    LeagueData,
 } from '../../../src/interfaces/nfl/nflPlayer';

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
        columns: {
          career_status: "status",
          game_status_abbr: "status_desription_abbr",
          game_status: "status_short_description",
          esb_id: "esb_id",
          gsis_id: "gsis_id",
          gsis_it_id: "gsis_it_id",
          smart_id: "smart_id",
          first_name: "first_name",
          last_name: "last_name",
          full_name: "display_name",
          short_name: "short_name",
          suffix: "suffix",
          birth_date: "birth_date",
          college_name: "college_name",
          college_conference: "college_conference",
          height: "height",
          weight: "weight",
          headshot_url: "headshot",
          position_group: "position_group",
          position: "position",
          jersey_number: "jersey_number",
          years_of_experience: "years_of_experience",
          team: "team_abbr",
          team_seq: "team_seq",
          team_id: "current_team_id",
          football_name: "",
          entry_year: "",
          rookie_year: "rookie_year",
          draft_team: "draft_club",
          draft_number: "draft_number",
          uniform_number: "",
          draft_round: "draft_round",
          season: "season"
        },
        url: "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv"
      }
    }
  };
  
  export const dataFile = "Massive Data File";
  export const noData: RawPlayerData[] = [];
  export const playerRecord = {
      player_id: 1001,
      career_status: 'ACT',
      game_status_abbr: 'ACT',
      game_status: 'Active',
      esb_id: '1',
      gsis_id: '2',
      gsis_it_id: '3',
      smart_id: '4',
      full_name: 'Test Me',
      first_name: 'Test',
      last_name: 'Me',
      short_name: 'T.Me',
      suffix: '',
      birth_date: '1990-09-08',
      college: 'Santa Clara',
      college_conference: 'WAC',
      height: '75',
      weight: '225',
      headshot_url: 'none',
      position_group: 'TE',
      position: 'TE',
      jersey_number: '87',
      years_of_experience: '16',
      team: 'KC',
      team_seq: '',
      team_id: '1234',
      rookie_year: '2008',
      draft_team: 'KC',
      draft_number: '256',
      draft_round: '7',
      season: '',
  }
  export const data: RawPlayerData[] = [playerRecord];
  
  export const playerData: PlayerData = {
    career_status: playerRecord.career_status,
    game_status_abbr: playerRecord.game_status_abbr,
    game_status: playerRecord.game_status,
    esb_id: playerRecord.esb_id,
    gsis_id: playerRecord.gsis_id,
    gsis_it_id: playerRecord.gsis_it_id,
    smart_id: playerRecord.smart_id,
    first_name: playerRecord.first_name,
    last_name: playerRecord.last_name,
    full_name: playerRecord.full_name,
    short_name: playerRecord.short_name,
    suffix: playerRecord.suffix,
  };
  
  export const leagueData: LeagueData = {
    player_id: 0,
    position_group: playerRecord.position_group,
    position: playerRecord.position,
    jersey_number: playerRecord.jersey_number,
    years_of_experience: playerRecord.years_of_experience,
    team: playerRecord.team,
    team_seq: playerRecord.team_seq,
    team_id: playerRecord.team_id,
    rookie_year: playerRecord.rookie_year,
    draft_team: playerRecord.draft_team,
    draft_number: playerRecord.draft_number,
    draft_round: playerRecord.draft_round,
    season: playerRecord.season,
  }
  
  export const bioData: BioData = {
    player_id: 0,
    birth_date: playerRecord.birth_date,
    college: playerRecord.college,
    college_conference: playerRecord.college_conference,
    height: playerRecord.height,
    weight: playerRecord.weight,
    headshot_url: playerRecord.headshot_url,
  };