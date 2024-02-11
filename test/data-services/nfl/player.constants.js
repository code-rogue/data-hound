"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bioData = exports.leagueData = exports.playerData = exports.data = exports.playerRecord = exports.noData = exports.dataFile = exports.configData = void 0;
exports.configData = {
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
exports.dataFile = "Massive Data File";
exports.noData = [];
exports.playerRecord = {
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
};
exports.data = [exports.playerRecord];
exports.playerData = {
    career_status: exports.playerRecord.career_status,
    game_status_abbr: exports.playerRecord.game_status_abbr,
    game_status: exports.playerRecord.game_status,
    esb_id: exports.playerRecord.esb_id,
    gsis_id: exports.playerRecord.gsis_id,
    gsis_it_id: exports.playerRecord.gsis_it_id,
    smart_id: exports.playerRecord.smart_id,
    first_name: exports.playerRecord.first_name,
    last_name: exports.playerRecord.last_name,
    full_name: exports.playerRecord.full_name,
    short_name: exports.playerRecord.short_name,
    suffix: exports.playerRecord.suffix,
};
exports.leagueData = {
    player_id: 0,
    position_group: exports.playerRecord.position_group,
    position: exports.playerRecord.position,
    jersey_number: exports.playerRecord.jersey_number,
    years_of_experience: exports.playerRecord.years_of_experience,
    team: exports.playerRecord.team,
    team_seq: exports.playerRecord.team_seq,
    team_id: exports.playerRecord.team_id,
    rookie_year: exports.playerRecord.rookie_year,
    draft_team: exports.playerRecord.draft_team,
    draft_number: exports.playerRecord.draft_number,
    draft_round: exports.playerRecord.draft_round,
    season: exports.playerRecord.season,
};
exports.bioData = {
    player_id: 0,
    birth_date: exports.playerRecord.birth_date,
    college: exports.playerRecord.college,
    college_conference: exports.playerRecord.college_conference,
    height: exports.playerRecord.height,
    weight: exports.playerRecord.weight,
    headshot_url: exports.playerRecord.headshot_url,
};
