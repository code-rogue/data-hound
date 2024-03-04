import * as cd from '../../../../../src/config/configData';
import * as util from '../../../../../src/data-services/utils/utils';

import {
  nextGenRushData as testData,
  configData,
  weeklyNextGenStatRushRecord as record,
} from '../../constants/config.constants';
import { Config } from '../../../../../src/interfaces/config/config';
import { DBService } from '../../../../../src/database/dbService';
import { LogContext } from '../../../../../src/log/log.enums';
import {
  NFLSchema,
  WeeklyNextGenRushTable as DBTable,
  WeeklyStatId as DBId,
} from '../../../../../src/constants/nfl/service.constants';
import { NFLWeeklyNextGenStatRushService } from '../../../../../src/data-services/nfl/weeklyNextGenStats/weeklyNextGenStatRushService';
import { ServiceName } from '../../../../../src/constants/nfl/service.constants';4

jest.mock('../../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyNextGenStatRushService;

describe('NFLWeeklyNextGenStatRushService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyNextGenStatRushService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_nextgen_rush_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyNextGenStatRushService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyNextGenStatRushService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_nextgen_rush_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(8);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.efficiency);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.attempts_gte_eight_defenders_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.avg_time_to_los);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.expected_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.yards_over_expected);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.avg_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.yards_over_expected_per_att);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.yards_over_expected_pct);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatRushService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyNextGenStatRushService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});