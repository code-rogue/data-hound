import { NFL_TEAM_IDS, NFL_TEAMS } from "@constants/nfl/team.enum";

export function teamLookup(teamName?: string): number | null {
    switch (teamName?.toUpperCase())  {
        case NFL_TEAMS.ARI:
            return NFL_TEAM_IDS.ARI;
        case NFL_TEAMS.ATL:
            return NFL_TEAM_IDS.ATL;
        case NFL_TEAMS.BAL:
            return NFL_TEAM_IDS.BAL;
        case NFL_TEAMS.BUF:
            return NFL_TEAM_IDS.BUF;
        case NFL_TEAMS.CAR:
            return NFL_TEAM_IDS.CAR;
        case NFL_TEAMS.CHI:
            return NFL_TEAM_IDS.CHI;
        case NFL_TEAMS.CIN:
            return NFL_TEAM_IDS.CIN;
        case NFL_TEAMS.CLE:
            return NFL_TEAM_IDS.CLE;
        case NFL_TEAMS.DAL:
            return NFL_TEAM_IDS.DAL;
        case NFL_TEAMS.DEN:
            return NFL_TEAM_IDS.DEN;
        case NFL_TEAMS.DET:
            return NFL_TEAM_IDS.DET;
        case NFL_TEAMS.GB:
            return NFL_TEAM_IDS.GB;
        case NFL_TEAMS.HOU:
            return NFL_TEAM_IDS.HOU;
        case NFL_TEAMS.IND:
            return NFL_TEAM_IDS.IND;
        case NFL_TEAMS.JAC:
        case NFL_TEAMS.JAX:
            return NFL_TEAM_IDS.JAC;
        case NFL_TEAMS.KC:
            return NFL_TEAM_IDS.KC;
        case NFL_TEAMS.LA:
        case NFL_TEAMS.LAR:
        case NFL_TEAMS.STL:
            return NFL_TEAM_IDS.LA;
        case NFL_TEAMS.LAC:
        case NFL_TEAMS.SD:
            return NFL_TEAM_IDS.LAC;
        case NFL_TEAMS.LV:
        case NFL_TEAMS.OAK:
            return NFL_TEAM_IDS.LV;
        case NFL_TEAMS.MIA:
            return NFL_TEAM_IDS.MIA;
        case NFL_TEAMS.MIN:
            return NFL_TEAM_IDS.MIN;
        case NFL_TEAMS.NE:
            return NFL_TEAM_IDS.NE;
        case NFL_TEAMS.NO:
            return NFL_TEAM_IDS.NO;
        case NFL_TEAMS.NYG:
            return NFL_TEAM_IDS.NYG;
        case NFL_TEAMS.NYJ:
            return NFL_TEAM_IDS.NYJ;
        case NFL_TEAMS.PHI:
            return NFL_TEAM_IDS.PHI;
        case NFL_TEAMS.PIT:
            return NFL_TEAM_IDS.PIT;
        case NFL_TEAMS.SEA:
            return NFL_TEAM_IDS.SEA;
        case NFL_TEAMS.SF:
            return NFL_TEAM_IDS.SF;
        case NFL_TEAMS.TB:
            return NFL_TEAM_IDS.TB;
        case NFL_TEAMS.TEN:
            return NFL_TEAM_IDS.TEN;
        case NFL_TEAMS.WAS:
            return NFL_TEAM_IDS.WAS;
        default:
            return null;
    }
}