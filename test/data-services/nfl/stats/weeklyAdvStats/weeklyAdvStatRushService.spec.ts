import * as cd from '@config/configData';
import * as util from '@utils/utils';

import {
  advRushData as testData,
  configData,
  weeklyAdvStatRushRecord as record,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import {
  NFLSchema,
  WeeklyAdvRushTable as DBTable,
  WeeklyStatId as DBId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyAdvStatRushService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatRushService';
import { ServiceName } from '@constants/nfl/service.constants';4

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatRushService;

describe('NFLWeeklyAdvStatRushService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatRushService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_rush_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyAdvStatRushService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyAdvStatRushService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_rush_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(5);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.yards_before_contact);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.yards_before_contact_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.yards_after_contact);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.yards_after_contact_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.broken_tackles);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});