import * as cd from '../../../../../src/config/configData';

import {
  BioTable,
  NFLSchema,
  PlayerGSIS,
  PlayerId,
  PlayerTable,
  WeeklyStatTable,
} from '../../../../../src/constants/nfl/service.constants';
import { Config } from '../../../../../src/interfaces/config/config';
import {
  configData,
  statRecord as record,
  statGameData as gameData,
  statBioData as bioData,
  weeklyPlayerData as playerData,
} from '../../constants/config.constants';
import { DBService } from '../../../../../src/database/dbService'
import { LogContext } from '../../../../../src/log/log.enums';
import { logger } from '../../../../../src/log/logger';
import { NFLStatService } from '../../../../../src/data-services/nfl/statService'
import { NFLWeeklyStatService } from '../../../../../src/data-services/nfl/weeklyStats/weeklyStatService';
import { ServiceName } from '../../../../../src/constants/nfl/service.constants';

jest.mock('../../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyStatService;

describe('NFLWeeklyStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyStatService();
  });

  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual({});
        expect(service.logContext).toEqual(LogContext.NFLWeeklyStatService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyStatService);
        expect(service.urls).toEqual([]);
    });
  });

  describe('parseBioData', () => {
    it('should parse successfully', () => {
        const result = bioData;
        result.player_id = 0;
        expect(service.parseBioData(record)).toEqual(result);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(record)).toEqual(result);
    });
  });

  describe('processBioRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseBioData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseBioData').mockImplementation(() => bioData);
      
      const player_id = record.player_id;
      await service.processBioRecord(player_id, record);
      
      expect(mockParseBioData).toHaveBeenCalledWith(record);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id, bioData);

      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseBioData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseBioData').mockImplementation(() => bioData);

      await expect(service.processBioRecord(1, record)).rejects.toThrow(error);
      expect(mockParseBioData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });    
  });

  describe('processGameRecord', () => {
    it.each([
      [true, record, { id: record.player_weekly_id }],
      [false, record, { id: 0 }],
      [false, record, undefined],
    ])('should run successfully - exists: "%s"', async (exists, row, fetchedRecord) => {
      const player_id = row.player_id;
      const weekly_id = record.player_weekly_id;

      const query = `SELECT id FROM ${NFLSchema}.${WeeklyStatTable} WHERE ${PlayerId} = $1 AND season = $2 AND week = $3`;
      const keys = [player_id, gameData.season, gameData.week];

      const mockParseGameData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords')
        .mockImplementation(() => Promise.resolve( (fetchedRecord?.id) ? [fetchedRecord] : undefined));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(row.player_weekly_id));

      const result = await service.processGameRecord(player_id, row);
      expect(result).toEqual(weekly_id);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);

      if (exists) {
        const { player_id, ...updatedData } = gameData;
        expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, WeeklyStatTable, 'id', weekly_id, updatedData);
      } 
      else {
        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, WeeklyStatTable, gameData);
      }

      mockParseGameData.mockRestore();
      mockFetchRecords.mockRestore();
      mockUpdateRecord.mockRestore();
      mockInsertRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseGameData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.processGameRecord(1, record)).rejects.toThrow(error);
      expect(mockParseGameData).toHaveBeenCalledWith(record);
      mockParseGameData.mockRestore();
      mockFetchRecords.mockRestore();
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

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessBioRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`,
          service.logContext);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessStatRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, service.logContext);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(record.player_weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`,service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`,service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(`${service.serviceName} did not complete`, error.message, service.logContext);

      mockRunService.mockRestore();
    });
  });
});