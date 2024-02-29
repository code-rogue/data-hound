import * as cd from '../../../../../src/config/configData';
import * as util from '../../../../../src/data-services/utils/utils';

import { Config } from '../../../../../src/interfaces/config/config';
import {
  configData,
  seasonAdvPassData as testData,
  seasonAdvStatPassRecord as record,
} from '../../constants/config.constants';
import { DBService } from '../../../../../src/database/dbService';
import { LogContext } from '../../../../../src/log/log.enums';
import {
  NFLSchema,
  SeasonAdvPassTable as DBTable,
  SeasonStatId as TableId,
} from '../../../../../src/constants/nfl/service.constants';
import { NFLSeasonAdvStatPassService } from '../../../../../src/data-services/nfl/seasonAdvStats/seasonAdvStatPassService';
import { ServiceName } from '../../../../../src/constants/nfl/service.constants';

jest.mock('../../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLSeasonAdvStatPassService;

describe('NFLSeasonAdvStatPassService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLSeasonAdvStatPassService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_season_adv_pass_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLSeasonAdvStatPassService);
        expect(service.serviceName).toEqual(ServiceName.NFLSeasonAdvStatPassService);
        expect(service.urls).toEqual(configData.nfl.player_season_adv_pass_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_season_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(24);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.attempts);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.throw_aways);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.spikes);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.drops);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.drop_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.bad_throws);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.bad_throw_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.pocket_time);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.blitzed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.hurried);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.hit);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.pressured);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.pressured_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.batted_balls);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.on_tgt_throws);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.on_tgt_throws_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(17, record.rpo_plays);
      expect(mockParseNumber).toHaveBeenNthCalledWith(18, record.rpo_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(19, record.rpo_pass_attempts);
      expect(mockParseNumber).toHaveBeenNthCalledWith(20, record.rpo_pass_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(21, record.rpo_rush_attempts);
      expect(mockParseNumber).toHaveBeenNthCalledWith(22, record.rpo_rush_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(23, record.pa_pass_attempts);
      expect(mockParseNumber).toHaveBeenNthCalledWith(24, record.pa_pass_yards);
    });
  });
  
  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLSeasonAdvStatPassService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});