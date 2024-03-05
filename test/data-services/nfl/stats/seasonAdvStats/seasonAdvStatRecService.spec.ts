import * as cd from '@config/configData';
import * as util from '@utils/utils';

import { Config } from '@interfaces/config/config';
import {
  configData,
  seasonAdvRecData as testData,
  seasonAdvStatRecRecord as record,
} from '@test-nfl-constants/config.constants';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import {
  NFLSchema,
  SeasonAdvRecTable as DBTable,
  SeasonStatId as TableId,
} from '@constants/nfl/service.constants';
import { NFLSeasonAdvStatRecService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatRecService';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLSeasonAdvStatRecService;

describe('NFLSeasonAdvStatRecService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLSeasonAdvStatRecService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_season_adv_rec_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLSeasonAdvStatRecService);
        expect(service.serviceName).toEqual(ServiceName.NFLSeasonAdvStatRecService);
        expect(service.urls).toEqual(configData.nfl.player_season_adv_rec_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_season_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(16);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.targets);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.receptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.tds);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.longest_rec);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.air_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.air_yards_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.yards_after_contact);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.yards_after_contact_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.adot);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.broken_tackles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.broken_tackles_avg);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.drops);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.drop_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.interceptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.qb_rating);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatRecService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});