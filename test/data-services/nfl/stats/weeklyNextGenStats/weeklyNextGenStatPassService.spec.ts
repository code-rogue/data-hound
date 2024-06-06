import * as cd from '@config/configData';
import * as util from '@utils/utils';

import {
  nextGenPassData as testData,
  configData,
  weeklyNextGenStatPassRecord as record,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    SeasonNextGenPassTable as SeasonDBTable,
    SeasonStatId as SeasonDBId,
    WeeklyNextGenPassTable as DBTable,
    WeeklyStatId as DBId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyNextGenStatPassService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatPassService';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyNextGenStatPassService;

describe('NFLWeeklyNextGenStatPassService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    service = new NFLWeeklyNextGenStatPassService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_nextgen_pass_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyNextGenStatPassService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyNextGenStatPassService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_nextgen_pass_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(mockParseNumber).toHaveBeenCalledTimes(13);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.aggressiveness);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.avg_time_to_throw);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.avg_air_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.max_air_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.avg_completed_air_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.avg_intended_air_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.avg_air_yards_differential);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.avg_air_yards_to_sticks);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.max_completed_air_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.passer_rating);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.completion_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.expected_completion_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.completions_above_expectation_pct);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);
      
      const weekly_id = record.player_weekly_id;
      await service.processStatRecord(weekly_id, record);
      
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, DBTable, DBId, weekly_id, testData);

      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });

  describe('processSeasonStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processSeasonStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});