import * as cd from '@config/configData';
import * as team from '@utils/teamUtils';
import {
  nextGenStatRecord as record,
  nextGenStatGameData as gameData,
  nextGenStatLeagueData as leagueData,
  nextGenStatPlayerData as playerData,
  configData,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { GameData, LeagueData, PlayerData, RawWeeklyStatData } from '@interfaces/nfl/stats';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService';
import { NFLWeeklyNextGenStatService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatService';
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockTeamLookup: jest.SpyInstance<number | null, [teamName?: string | undefined], any>;
let service: NFLWeeklyNextGenStatService;

describe('NFLWeeklyNextGenStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockTeamLookup = jest.spyOn(team, 'teamLookup').mockImplementation(() => 5);
    service = new NFLWeeklyNextGenStatService();
  });

  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual({});
        expect(service.logContext).toEqual(LogContext.NFLWeeklyNextGenStatService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyNextGenStatService);
        expect(service.urls).toEqual([]);
    });
  });

  describe('parsePlayerData', () => {
    it('should parse successfully', () => {
      expect(service.parsePlayerData(record)).toEqual(playerData);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
      // remove the team column
      const {team, ...result}: GameData = gameData;
      result.player_id = 0;
      expect(service.parseGameData(record)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenCalledWith(record.team);
    });
  });
  
  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
      // remove the team column
      const {team, ...result}: LeagueData = leagueData;
      result.player_id = 0;
      expect(service.parseLeagueData(record)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenCalledWith(record.team);
    });
  });

  describe('parseUnmatchedPlayerData', () => {
    const unmatchedData = {
      gsis_id: 'string',
      full_name: 'Travis Kelce',
      stat_service: ServiceName.NFLWeeklyNextGenStatService,
      team: 'KC',
      team_id: 5,
      season: '2023',
      week: '3'
    } as unknown as RawWeeklyStatData;

    it('should parse successfully', () => {
      // remove the team column
      const {team, ...result} = unmatchedData;
      expect(service.parseUnmatchedPlayerData(unmatchedData)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenCalledWith(unmatchedData.team);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, 0, 0, 0],
      [1001, 0, 0, 0],
      [1002, 1, 0, 0],
      [1003, 0, 0, 0],
      [1004, 0, 0, 1],
      [1005, 0, 1, 1],
      [1006, 1, 0, 1],
      [1007, 1, 0, 0],
    ])('should run successfully - player_id: %s, season: %s, weekly: %s, week: %s', async (player_id, season_id, weekly_id, week) => {
      const playerDataRecord = record;
      record.week = week.toString();

      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData')
        .mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerById')
        .mockReturnValue(Promise.resolve(player_id));
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord')
        .mockImplementation();
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'processStatRecord')
        .mockImplementation();
      const mockProcessSeasonRecord = jest.spyOn(NFLStatService.prototype, 'processSeasonRecord')
        .mockImplementation(() => Promise.resolve(season_id));
      const mockProcessSeasonStatRecord = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'processSeasonStatRecord')
        .mockImplementation();

      await service.processPlayerDataRow(playerDataRecord);
      expect(mockParsePlayerData).toHaveBeenCalledWith(playerDataRecord);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData, PlayerIdentifiers.GSIS);

      if (player_id === 0) {
        expect(mockProcessLeagueRecord).toHaveBeenCalledTimes(0);
        expect(mockProcessSeasonRecord).toHaveBeenCalledTimes(0);
        expect(mockProcessSeasonStatRecord).toHaveBeenCalledTimes(0);
        expect(mockProcessGameRecord).toHaveBeenCalledTimes(0);
        expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
      } else {
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(player_id, playerDataRecord);
        if(week === 0) {
          expect(mockProcessSeasonRecord).toHaveBeenCalledWith(player_id, playerDataRecord);
          if(season_id === 0) {
            expect(mockProcessSeasonStatRecord).toHaveBeenCalledTimes(0);
          }
          else {
            expect(mockProcessSeasonStatRecord).toHaveBeenCalledWith(season_id, playerDataRecord);
          }
            
        } else {
          expect(mockProcessGameRecord).toHaveBeenCalledWith(player_id, playerDataRecord);
          if(weekly_id === 0) {
            expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          }
          else {
            expect(mockProcessStatRecord).toHaveBeenCalledWith(weekly_id, playerDataRecord);
          }
        }
        expect(logger.debug).toHaveBeenNthCalledWith(2,`Completed processing player record: ${JSON.stringify(playerDataRecord)}.`, service.logContext);
      }

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
      mockProcessSeasonRecord.mockRestore();
      mockProcessSeasonStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerById').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData, PlayerIdentifiers.GSIS);

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });  
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLWeeklyStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`, service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLWeeklyStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`, service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(`${service.serviceName} did not complete`, error.message, service.logContext);

      mockRunService.mockRestore();
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processSeasonStatRecord', () => {
    it('should run successfully', async () => {
      await service.processSeasonStatRecord(1, record);
    });
  });
});