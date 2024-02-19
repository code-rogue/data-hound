import { NFLWeeklyStatService, PlayerGUID } from '../../../../src/data-services/nfl/weeklyStatService';
import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
  NFLSchema,
  PlayerTable,
} from '../../../../src/constants/nfl/service.constants';

import {
  configData,
  dataFile,
  weeklyStatRecord,
  rawWeeklyStatData as data,
  weeklyPlayerData as playerData,
} from '../constants/config.constants';

import { DBService } from '../../../../src/database/dbService';

 jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let service: NFLWeeklyStatService;

describe('NFLPlayerWeeklyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    service = new NFLWeeklyStatService();
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockParseAndLoadWeeklyStats = jest.spyOn(NFLWeeklyStatService.prototype, 'parseAndLoadWeeklyStats').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Stats Service started...', LogContext.NFLWeeklyStatsService)
      
      const urls = configData.nfl.player_weekly_stats.url;
      expect(mockParseAndLoadWeeklyStats).toHaveBeenCalledTimes(urls.length);
      urls.forEach(url => {
        expect(mockParseAndLoadWeeklyStats).toHaveBeenCalledWith(url);

      })
      
      mockParseAndLoadWeeklyStats.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockParseAndLoadWeeklyStats = jest.spyOn(NFLWeeklyStatService.prototype, 'parseAndLoadWeeklyStats').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Stats Service started...', LogContext.NFLWeeklyStatsService)
      
      expect(mockParseAndLoadWeeklyStats).toHaveBeenCalledWith(configData.nfl.player_weekly_stats.url[0]);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Stats Service did not complete', error.message, LogContext.NFLWeeklyStatsService)

      mockParseAndLoadWeeklyStats.mockRestore();
    });
  });

  describe('parseAndLoadWeeklyStats', () => {
    const url = 'testUrl';
    
    it('should run successfully', async () => {
      const mockProcessPlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'processPlayerData').mockImplementation();
      
      await service.parseAndLoadWeeklyStats(url);
      
      expect(logger.log).toHaveBeenNthCalledWith(1, `Downloading and parsing: ${url}`, LogContext.NFLWeeklyStatsService);
      expect(mockDownloadCSV).toHaveBeenCalledWith(url);
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.player_weekly_stats.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);

      expect(logger.log).toHaveBeenNthCalledWith(2, `Completed processing: ${url}`, LogContext.NFLWeeklyStatsService);
      mockProcessPlayerData.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'processPlayerData').mockRejectedValue(error);

      await expect(service.parseAndLoadWeeklyStats(url)).rejects.toThrow(error);
      mockProcessPlayerData.mockRestore();
    });
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyStatRecord],
      [1001, false, weeklyStatRecord],
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
      const mockProcessPassRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processPassRecord').mockImplementation();
      const mockProcessRushRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRushRecord').mockImplementation();
      const mockProcessRecRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerGUID, playerData.gsis_id, 'id');

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`,
          LogContext.NFLWeeklyStatsService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessPassRecord).toHaveBeenCalledWith(weekly_id, row);
      expect(mockProcessRushRecord).toHaveBeenCalledWith(weekly_id, row);
      expect(mockProcessRecRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatsService);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessPassRecord.mockRestore();
      mockProcessRushRecord.mockRestore();
      mockProcessRecRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyStatRecord);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyStatRecord.player_weekly_id));
      const mockProcessPassRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processPassRecord').mockRejectedValue(error);
      const mockProcessRushRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRushRecord').mockImplementation();
      const mockProcessRecRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecRecord').mockImplementation();

      await expect(service.processPlayerDataRow(weeklyStatRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessPassRecord.mockRestore();
      mockProcessRushRecord.mockRestore();
      mockProcessRecRecord.mockRestore();
    });
  });
});