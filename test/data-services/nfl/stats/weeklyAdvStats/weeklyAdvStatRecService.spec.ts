import * as cd from '@config/configData';
import * as util from '@utils/utils';

import {
  advRecData as testData,
  configData,
  weeklyAdvStatRecRecord as record,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService'
import { LogContext } from '@log/log.enums';
import {
  NFLSchema,
  WeeklyAdvRecTable as DBTable,
  WeeklyStatId as DBId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyAdvStatRecService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatRecService'
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatRecService;

describe('NFLWeeklyAdvStatRecService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatRecService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_rec_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyAdvStatRecService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyAdvStatRecService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_rec_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(5);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.broken_tackles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.drops);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.drop_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.interceptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.qb_rating);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockProcessStatRecord).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });    
  });
});