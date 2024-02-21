import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';
import * as util from '../../../../src/data-services/nfl/utils/utils';

import {
    NFLSchema,
    BioTable,
    LeagueTable,
    PlayerId,
    WeeklyStatTable,
} from '../../../../src/constants/nfl/service.constants';

import { 
    NFLStatService,
 } from '../../../../src/data-services/nfl/statService';

import {
    configData,
    dataFile,
    noRawStatData as noData,
    statRecord,
    rawStatData as data,
    statGameData as gameData,
    statBioData as bioData,
    statLeagueData as leagueData,
    statPlayerData as playerData,
} from '../constants/config.constants';


import type {
  StringSplitResult,
} from '../../../../src/data-services/nfl/utils/utils';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null, delimiter: string], any>;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let service: NFLStatService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    service = new NFLStatService();
  });

  describe('parsePlayerData', () => {
    it('should parse successfully', () => {
      const result = playerData
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(statRecord)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(statRecord.full_name, ' ');
    });
  });

  describe('parseBioData', () => {
    it('should parse successfully', () => {
        const result = bioData;
        result.player_id = 0;
        expect(service.parseBioData(statRecord)).toEqual(result);
    });
  });

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(statRecord)).toEqual(result);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(statRecord)).toEqual(result);
    });
  });

  describe('processBioRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseBioData = jest.spyOn(NFLStatService.prototype, 'parseBioData').mockImplementation(() => bioData);
      
      const player_id = statRecord.player_id;
      await service.processBioRecord(player_id, statRecord);
      
      expect(mockParseBioData).toHaveBeenCalledWith(statRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id, bioData);

      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseBioData = jest.spyOn(NFLStatService.prototype, 'parseBioData').mockImplementation(() => bioData);

      await expect(service.processBioRecord(1, statRecord)).rejects.toThrow(error);
      expect(mockParseBioData).toHaveBeenCalledWith(statRecord);
      
      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });    
  });

  describe('processLeagueRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseLeagueData = jest.spyOn(NFLStatService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);
      
      const player_id = statRecord.player_id;
      await service.processLeagueRecord(player_id, statRecord);
      
      expect(mockParseLeagueData).toHaveBeenCalledWith(statRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, LeagueTable, PlayerId, player_id, leagueData);

      mockProcessRecord.mockRestore();
      mockParseLeagueData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseLeagueData = jest.spyOn(NFLStatService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);

      await expect(service.processLeagueRecord(1, statRecord)).rejects.toThrow(error);
      expect(mockParseLeagueData).toHaveBeenCalledWith(statRecord);
      
      mockParseLeagueData.mockRestore();
      mockProcessRecord.mockRestore();
    });    
  });

  describe('processGameRecord', () => {
    it.each([
      [true, statRecord, { id: statRecord.player_weekly_id }],
      [false, statRecord, { id: 0 }],
      [false, statRecord, undefined],
    ])('should run successfully - exists: "%s"', async (exists, row, record) => {
      const player_id = row.player_id;
      const weekly_id = statRecord.player_weekly_id;

      const mockParseGameData = jest.spyOn(NFLStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords')
        .mockImplementation(() => Promise.resolve( (record?.id) ? [record] : undefined));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(row.player_weekly_id));

      const result = await service.processGameRecord(player_id, row);
      expect(result).toEqual(weekly_id);

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

    it('processGameRecord should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseGameData = jest.spyOn(NFLStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.processGameRecord(1, statRecord)).rejects.toThrow(error);
      expect(mockParseGameData).toHaveBeenCalledWith(statRecord);
      mockParseGameData.mockRestore();
      mockFetchRecords.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processPlayerDataRow(statRecord);
    });
  });

  describe('processPlayerData', () => {
    it.each([
      [noData],
      [data],
      [[statRecord, statRecord]],
    ])('should run processPlayerData successfully', async (data) => {
      const mockProcessPlayerDataRow = jest.spyOn(NFLStatService.prototype, 'processPlayerDataRow').mockImplementation();
      await service.processPlayerData(data);
      
      expect(logger.log).toHaveBeenCalledWith(`Processing player records [${data.length}]`, LogContext.NFLStatService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledTimes(data.length);
      data.forEach(row => {
        expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(row);
      })
      
      expect(logger.log).toHaveBeenCalledWith('Processed player records.', LogContext.NFLStatService);
      mockProcessPlayerDataRow.mockRestore();
    });

    it('processPlayerData should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerDataRow = jest.spyOn(NFLStatService.prototype, 'processPlayerDataRow').mockRejectedValue(error);

      await expect(service.processPlayerData(data)).rejects.toThrow(error);

      expect(logger.log).toHaveBeenNthCalledWith(1, `Processing player records [1]`, LogContext.NFLStatService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(statRecord);

      mockProcessPlayerDataRow.mockRestore();
    });
  });

  describe('parseAndLoadWeeklyStats', () => {
    const url = 'testUrl';
    
    it('should run successfully', async () => {
      const mockProcessPlayerData = jest.spyOn(NFLStatService.prototype, 'processPlayerData').mockImplementation();
      service.columns = configData.nfl.player_weekly_stats.columns;
      await service.parseAndLoadWeeklyStats(url);
      
      expect(logger.log).toHaveBeenNthCalledWith(1, `Downloading and parsing: ${url}`, LogContext.NFLStatService);
      expect(mockDownloadCSV).toHaveBeenCalledWith(url);
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.player_weekly_stats.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);

      expect(logger.log).toHaveBeenNthCalledWith(2, `Completed processing: ${url}`, LogContext.NFLStatService);
      mockProcessPlayerData.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerData = jest.spyOn(NFLStatService.prototype, 'processPlayerData').mockRejectedValue(error);

      await expect(service.parseAndLoadWeeklyStats(url)).rejects.toThrow(error);
      mockProcessPlayerData.mockRestore();
    });
  });

  describe('runService', () => {
    const url = 'testURL';
    it('should run successfully', async () => {
      const mockParseAndLoadWeeklyStats = jest.spyOn(NFLStatService.prototype, 'parseAndLoadWeeklyStats').mockImplementation();
      
      const urls = configData.nfl.player_weekly_stats.urls;
      service.urls = urls;
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadWeeklyStats).toHaveBeenCalledTimes(urls.length);
      urls.forEach(url => {
        expect(mockParseAndLoadWeeklyStats).toHaveBeenCalledWith(url);

      })
      
      mockParseAndLoadWeeklyStats.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockParseAndLoadWeeklyStats = jest.spyOn(NFLStatService.prototype, 'parseAndLoadWeeklyStats').mockRejectedValue(error);

      service.urls = configData.nfl.player_weekly_stats.urls;
      await expect(service.runService()).rejects.toThrow(error);

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadWeeklyStats).toHaveBeenCalledWith(service.urls[0]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);

      mockParseAndLoadWeeklyStats.mockRestore();
    });
  });
});