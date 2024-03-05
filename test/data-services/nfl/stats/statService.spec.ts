import * as cd from '@config/configData';
import * as csv from '@csv/csvService';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService'
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import * as util from '@data-services/utils/utils';

import {
  NFLSchema,
  LeagueTable,
  PlayerFullName,
  PlayerId,
  PlayerPFR,
  PlayerTable,
} from '@constants/nfl/service.constants';

import { 
    NFLStatService,
 } from '@data-services/nfl/statService';

import {
    configData,
    dataFile,
    noRawStatData as noData,
    statRecord,
    rawStatData as data,
    statLeagueData as leagueData,
    statPlayerData as playerData,
} from '@test-nfl-constants/config.constants';

import type { 
  PlayerData,
} from '@interfaces/nfl/stats';

import type {
  StringSplitResult,
} from '@utils/utils';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
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

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(statRecord)).toEqual(result);
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

  describe('findPlayerByPFR', () => {
    const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerPFR} = $1 OR ${PlayerFullName} = $2`;
    const { pfr_id, ...noPFRIdData }: PlayerData = playerData;

    it.each([
      [1, playerData, {id: 1001}],
      [2, noPFRIdData as PlayerData, undefined],
    ])('should run successfully - idx: %s', async (idx, data, record) => {
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        if(record)
          return Promise.resolve([record]); 

          return Promise.resolve([] as unknown as [unknown]);
      });

      const keys = [data.pfr_id ?? '', data.full_name];
      const player_id = await service.findPlayerByPFR(data);
      if(record)
        expect(player_id).toEqual(record.id);
      else
        expect(player_id).toEqual(0);

      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      const keys = [playerData.pfr_id ?? '', playerData.full_name];
      await expect(service.findPlayerByPFR(playerData)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);
      
      mockFetchRecords.mockRestore();
    });    
  });

  describe('parseAndLoadStats', () => {
    const url = 'testUrl';
    
    it('should run successfully', async () => {
      const mockProcessPlayerData = jest.spyOn(NFLStatService.prototype, 'processPlayerData').mockImplementation();
      service.columns = configData.nfl.player_weekly_stats.columns;
      await service.parseAndLoadStats(url);
      
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

      await expect(service.parseAndLoadStats(url)).rejects.toThrow(error);
      mockProcessPlayerData.mockRestore();
    });
  });

  describe('runService', () => {
    const url = 'testURL';
    it('should run successfully', async () => {
      const mockParseAndLoadStats = jest.spyOn(NFLStatService.prototype, 'parseAndLoadStats').mockImplementation();
      
      const urls = configData.nfl.player_weekly_stats.urls;
      service.urls = urls;
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadStats).toHaveBeenCalledTimes(urls.length);
      urls.forEach(url => {
        expect(mockParseAndLoadStats).toHaveBeenCalledWith(url);

      })
      
      mockParseAndLoadStats.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockParseAndLoadStats = jest.spyOn(NFLStatService.prototype, 'parseAndLoadStats').mockRejectedValue(error);

      service.urls = configData.nfl.player_weekly_stats.urls;
      await expect(service.runService()).rejects.toThrow(error);

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadStats).toHaveBeenCalledWith(service.urls[0]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);

      mockParseAndLoadStats.mockRestore();
    });
  });
});