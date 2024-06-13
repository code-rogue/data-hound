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
import { GameData, LeagueData, PlayerData } from '@interfaces/nfl/stats';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService';
import { NFLWeeklyNextGenStatService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatService';
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
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

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    const noGSIS = {
      full_name: 'Travis Kelce',
    } as PlayerData;

    const blankGSIS = {
      full_name: 'Travis Kelce',
      gsis_id: '',
    } as PlayerData;

    const fullPlayerRecord = {
      full_name: 'Travis Kelce',
      gsis_id: 'string',
    } as PlayerData;

    it.each([
      [0, 0, 0, 0, fullPlayerRecord],
      [1001, 0, 0, 0, noGSIS],
      [1002, 1, 0, 0, blankGSIS],
      [1003, 0, 0, 0, fullPlayerRecord],
      [1004, 0, 0, 1, fullPlayerRecord],
      [1005, 0, 1, 1, fullPlayerRecord],
      [1006, 1, 0, 1, fullPlayerRecord],
      [1007, 1, 0, 0, fullPlayerRecord],
    ])('should run successfully - id: %s, season: %s, weekly: %s, week: %s', async (player_id, season_id, weekly_id, week, data) => {
      const playerDataRecord = record;
      record.week = week.toString();

      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData')
        .mockImplementation(() => data);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByGSIS')
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
      if (!data.gsis_id || data.gsis_id === '') {
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing GSIS Id: ${JSON.stringify(data)}.`, service.logContext);
      } else {
        expect(mockFindPlayer).toHaveBeenCalledWith(data);

        if (player_id === 0) {
          expect(logger.notice).toHaveBeenCalledWith(`No Player Found: ${data.full_name} [${data.gsis_id}].`, service.logContext);
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
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByGSIS').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it.skip('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByGSIS').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(record.player_weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
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