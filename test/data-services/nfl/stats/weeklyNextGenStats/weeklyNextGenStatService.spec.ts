import * as cd from '@config/configData';

import {
  nextGenStatRecord as record,
  nextGenStatGameData as gameData,
  nextGenStatLeagueData as leagueData,
  nextGenStatPlayerData as playerData,
  configData,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService';
import { NFLWeeklyNextGenStatService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatService';
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
import {
  NFLSchema,
  PlayerGSIS,
  PlayerTable,
} from '@constants/nfl/service.constants';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyNextGenStatService;

describe('NFLWeeklyAdvStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
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
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(record)).toEqual(result);
    });
  });
  
  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(record)).toEqual(result);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, record],
      [1001, false, record],
    ])('should run successfully - id: %s, insert: %s', async (player_id, bInsert, row) => {
      let id = player_id;
      const weekly_id = row.player_weekly_id;

      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(NFLStatService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerGSIS, row.gsis_id, 'id');

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`,
        service.logContext);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessStatRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, service.logContext);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(NFLStatService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(NFLStatService.prototype, 'recordLookup').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(record.player_weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyNextGenStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
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
});