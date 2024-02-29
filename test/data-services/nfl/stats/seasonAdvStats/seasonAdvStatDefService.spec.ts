import * as cd from '../../../../../src/config/configData';
import * as util from '../../../../../src/data-services/utils/utils';

import { Config } from '../../../../../src/interfaces/config/config';
import {
  configData,
  seasonAdvDefData as testData,
  seasonAdvStatDefRecord as record,
} from '../../constants/config.constants';
import { DBService } from '../../../../../src/database/dbService';
import { LogContext } from '../../../../../src/log/log.enums';
import {
  NFLSchema,
  SeasonAdvDefTable as DBTable,
  SeasonStatId as TableId,
} from '../../../../../src/constants/nfl/service.constants';
import { NFLSeasonAdvStatDefService } from '../../../../../src/data-services/nfl/seasonAdvStats/seasonAdvStatDefService';
import { ServiceName } from '../../../../../src/constants/nfl/service.constants';

jest.mock('../../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLSeasonAdvStatDefService;

describe('NFLSeasonAdvStatDefService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLSeasonAdvStatDefService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_season_adv_def_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLSeasonAdvStatDefService);
        expect(service.serviceName).toEqual(ServiceName.NFLSeasonAdvStatDefService);
        expect(service.urls).toEqual(configData.nfl.player_season_adv_def_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_season_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(20);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.interceptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.targets);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.completions_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.completion_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.yards_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.yards_allowed_per_cmp);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.yards_allowed_per_tgt);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.tds_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.passer_rating_allowed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.adot);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.air_yards_completed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.yards_after_catch);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.blitzed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.hurried);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.qbkd);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.sacks);
      expect(mockParseNumber).toHaveBeenNthCalledWith(17, record.pressures);
      expect(mockParseNumber).toHaveBeenNthCalledWith(18, record.tackles_combined);
      expect(mockParseNumber).toHaveBeenNthCalledWith(19, record.tackles_missed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(20, record.tackles_missed_pct);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatDefService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatDefService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});