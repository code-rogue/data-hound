import { teamLookup } from '@utils/teamUtils'
import { NFL_TEAM_IDS, NFL_TEAMS } from "@constants/nfl/team.enum";

describe('Team Utils', () => {
    describe('teamLookup', () => {
      it.each([
        [undefined, null],
        ['', null],
        [NFL_TEAMS.ARI, NFL_TEAM_IDS.ARI],
        [NFL_TEAMS.ATL, NFL_TEAM_IDS.ATL],
        [NFL_TEAMS.BAL, NFL_TEAM_IDS.BAL],
        [NFL_TEAMS.BUF, NFL_TEAM_IDS.BUF],
        [NFL_TEAMS.CAR, NFL_TEAM_IDS.CAR],
        [NFL_TEAMS.CHI, NFL_TEAM_IDS.CHI],
        [NFL_TEAMS.CIN, NFL_TEAM_IDS.CIN],
        [NFL_TEAMS.CLE, NFL_TEAM_IDS.CLE],
        [NFL_TEAMS.DAL, NFL_TEAM_IDS.DAL],
        [NFL_TEAMS.DEN, NFL_TEAM_IDS.DEN],
        [NFL_TEAMS.DET, NFL_TEAM_IDS.DET],
        [NFL_TEAMS.GB, NFL_TEAM_IDS.GB],
        [NFL_TEAMS.HOU, NFL_TEAM_IDS.HOU],
        [NFL_TEAMS.IND, NFL_TEAM_IDS.IND],
        [NFL_TEAMS.JAC, NFL_TEAM_IDS.JAC],
        [NFL_TEAMS.JAX, NFL_TEAM_IDS.JAC],
        [NFL_TEAMS.KC, NFL_TEAM_IDS.KC],
        [NFL_TEAMS.LA, NFL_TEAM_IDS.LA],
        [NFL_TEAMS.LAR, NFL_TEAM_IDS.LA],
        [NFL_TEAMS.STL, NFL_TEAM_IDS.LA],
        [NFL_TEAMS.LAC, NFL_TEAM_IDS.LAC],
        [NFL_TEAMS.SD, NFL_TEAM_IDS.LAC],
        [NFL_TEAMS.LV, NFL_TEAM_IDS.LV],
        [NFL_TEAMS.LVR, NFL_TEAM_IDS.LV],
        [NFL_TEAMS.OAK, NFL_TEAM_IDS.LV],
        [NFL_TEAMS.MIA, NFL_TEAM_IDS.MIA],
        [NFL_TEAMS.MIN, NFL_TEAM_IDS.MIN],
        [NFL_TEAMS.NE, NFL_TEAM_IDS.NE],
        [NFL_TEAMS.NO, NFL_TEAM_IDS.NO],
        [NFL_TEAMS.NYG, NFL_TEAM_IDS.NYG],
        [NFL_TEAMS.NYJ, NFL_TEAM_IDS.NYJ],
        [NFL_TEAMS.PHI, NFL_TEAM_IDS.PHI],
        [NFL_TEAMS.PIT, NFL_TEAM_IDS.PIT],
        [NFL_TEAMS.SEA, NFL_TEAM_IDS.SEA],
        [NFL_TEAMS.SF, NFL_TEAM_IDS.SF],
        [NFL_TEAMS.TB, NFL_TEAM_IDS.TB],
        [NFL_TEAMS.TEN, NFL_TEAM_IDS.TEN],
        [NFL_TEAMS.WAS, NFL_TEAM_IDS.WAS],        
        [NFL_TEAMS.TwoTM, NFL_TEAM_IDS.TwoTM],
        [NFL_TEAMS.ThreeTM, NFL_TEAM_IDS.ThreeTM],
      ])('should return the correct team id - team: %s', (team, result) => {
            expect(teamLookup(team)).toEqual(result);
      })
    })
});