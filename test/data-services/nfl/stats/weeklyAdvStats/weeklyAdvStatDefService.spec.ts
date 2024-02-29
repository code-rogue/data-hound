import * as cd from '../../../../../src/config/configData';
import * as util from '../../../../../src/data-services/utils/utils';

import { Config } from '../../../../../src/interfaces/config/config';
import {
  configData,
  weeklyAdvDefData as testData,
  weeklyAdvStatDefRecord as record,
} from '../../constants/config.constants';
import { DBService } from '../../../../../src/database/dbService';
import { LogContext } from '../../../../../src/log/log.enums';
import {
    NFLSchema,
    WeeklyAdvDefTable as DBTable,
    WeeklyStatId as DBId,
} from '../../../../../src/constants/nfl/service.constants';
import { NFLWeeklyAdvStatDefService } from '../../../../../src/data-services/nfl/weeklyAdvStats/weeklyAdvStatDefService';
import { ServiceName } from '../../../../../src/constants/nfl/service.constants';

jest.mock('../../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatDefService;

describe('NFLWeeklyAdvStatDefService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatDefService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_def_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyAdvStatDefService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyAdvStatDefService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_def_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(17);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.targets);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.completions_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.completion_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.yards_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.yards_allowed_per_cmp);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.yards_allowed_per_tgt);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.rec_td_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.passer_rating_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.adot);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.air_yards_completed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.yards_after_catch);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.blitzed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.hurried);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.pressures);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.tackles_combined);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.tackles_missed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(17, record.tackles_missed_pct);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});