import * as cd from '@config/configData';
import * as util from '@utils/utils';

import {
  nextGenRecData as testData,
  configData,
  weeklyNextGenStatRecRecord as record,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService'
import { LogContext } from '@log/log.enums';
import {
  NFLSchema,
  SeasonNextGenRecTable as SeasonDBTable,
  SeasonStatId as SeasonDBId,
  WeeklyNextGenRecTable as DBTable,
  WeeklyStatId as DBId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyNextGenStatRecService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatRecService'
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyNextGenStatRecService;

describe('NFLWeeklyNextGenStatRecService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyNextGenStatRecService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_nextgen_rec_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyNextGenStatRecService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyNextGenStatRecService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_nextgen_rec_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(mockParseNumber).toHaveBeenCalledTimes(8);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.avg_cushion);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.avg_separation);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.avg_intended_air_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.catch_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.share_of_intended_air_yards_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.avg_yac);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.avg_expected_yac);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.avg_yac_above_expectation);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyNextGenStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);
      
      const weekly_id = record.player_weekly_id;
      await service.processStatRecord(weekly_id, record);
      
      expect(mockProcessStatRecord).toHaveBeenCalledWith(record);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, DBTable, DBId, weekly_id, testData);

      mockProcessRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyNextGenStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockProcessStatRecord).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });    
  });

  describe('processSeasonStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);
      
      const weekly_id = record.player_weekly_id;
      await service.processSeasonStatRecord(weekly_id, record);
      
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, SeasonDBTable, SeasonDBId, weekly_id, testData);

      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processSeasonStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});