import * as cd from '@config/configData';
import * as util from '@utils/utils';

import {
  advPassData as testData,
  configData,
  weeklyAdvStatPassRecord as record,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import {
    NFLSchema,
    WeeklyAdvPassTable as DBTable,
    WeeklyStatId as DBId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyAdvStatPassService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatPassService';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatPassService;

describe('NFLWeeklyAdvStatPassService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    service = new NFLWeeklyAdvStatPassService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_pass_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyAdvStatPassService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyAdvStatPassService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_pass_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(11);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.pass_drops);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.pass_drop_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.rec_drop);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.rec_drop_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.bad_throws);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.bad_throw_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.blitzed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.hurried);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.hit);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.pressured);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.pressured_pct);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});