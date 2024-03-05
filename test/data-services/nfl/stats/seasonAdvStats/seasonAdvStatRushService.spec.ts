import * as cd from '@config/configData';
import * as util from '@utils/utils';

import { Config } from '@interfaces/config/config';
import {
  configData,
  seasonAdvRushData as testData,
  seasonAdvStatRushRecord as record,
} from '@test-nfl-constants/config.constants';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import {
  NFLSchema,
  SeasonAdvRushTable as DBTable,
  SeasonStatId as TableId,
} from '@constants/nfl/service.constants';
import { NFLSeasonAdvStatRushService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatRushService';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLSeasonAdvStatRushService;

describe('NFLSeasonAdvStatRushService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLSeasonAdvStatRushService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_season_adv_rush_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLSeasonAdvStatRushService);
        expect(service.serviceName).toEqual(ServiceName.NFLSeasonAdvStatRushService);
        expect(service.urls).toEqual(configData.nfl.player_season_adv_rush_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_season_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(10);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.attempts);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.tds);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.longest_rush);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.yards_before_contact);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.yards_before_contact_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.yards_after_contact);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.yards_after_contact_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.broken_tackles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.broken_tackles_avg);
    });
  });

    describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatRushService.prototype, 'parseStatData').mockImplementation(() => testData);
      
      const season_id = record.player_season_id;
      await service.processStatRecord(season_id, record);
      
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, DBTable, TableId, season_id, testData);

      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatRushService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});