import * as cd from '../../../../../src/config/configData';
import * as util from '../../../../../src/data-services/utils/utils';

import { Config } from '../../../../../src/interfaces/config/config';
import {
  configData,
  dataFile,
  weeklyStatRecord as record,
  rawWeeklyStatData as data,
  weeklyGameData as gameData,
  passData,
  rushData,
  recData,
} from '../../constants/config.constants';
import { DBService } from '../../../../../src/database/dbService'
import { LogContext } from '../../../../../src/log/log.enums';

import {
  NFLSchema,
  WeeklyPassTable as PassTable,
  WeeklyRecTable as RecTable,
  WeeklyRushTable as RushTable,
  WeeklyStatId,
} from '../../../../../src/constants/nfl/service.constants';

import {  NFLWeeklyStatOffService } from '../../../../../src/data-services/nfl/weeklyStats/weeklyStatOffService';
import { ServiceName } from '../../../../../src/constants/nfl/service.constants';

jest.mock('../../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyStatOffService;

describe('NFLWeeklyStatOffService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyStatOffService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyStatOffService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyStatOffService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_stats.urls);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(record)).toEqual(result);
    });
  });

  describe('parsePassData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parsePassData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(16);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.attempts);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.completions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.pass_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.pass_yards_after_catch);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.pass_air_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.pass_air_conversion_ratio);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.pass_first_downs);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.dakota);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.pass_epa);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.pass_tds);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.pass_two_pt_conversions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.interceptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.sacks);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.sack_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.sack_fumbles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.sack_fumbles_lost);
    });
  });

  describe('parseRushData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseRushData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(9);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.carries);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.rush_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.rush_first_downs);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.rush_epa);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.rush_tds);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.rush_two_pt_conversions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.rush_fumbles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.rush_fumbles_lost);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.special_teams_tds);
    });
  });

  describe('parseRecData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseRecData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(15);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.targets);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.receptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.target_share);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.rec_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.rec_yards_after_catch);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.rec_air_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.rec_air_yards_share);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.rec_air_conversion_ratio);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.weighted_opportunity_rating);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.rec_epa);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.rec_tds);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.rec_two_pt_conversions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.rec_first_downs);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.rec_fumbles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.rec_fumbles_lost);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParsePassData = jest.spyOn(NFLWeeklyStatOffService.prototype, 'parsePassData').mockImplementation(() => passData);
      const mockParseRushData = jest.spyOn(NFLWeeklyStatOffService.prototype, 'parseRushData').mockImplementation(() => rushData);
      const mockParseRecData = jest.spyOn(NFLWeeklyStatOffService.prototype, 'parseRecData').mockImplementation(() => recData);
      
      const weekly_id = record.player_weekly_id;
      await service.processStatRecord(weekly_id, record);
      
      expect(mockParsePassData).toHaveBeenCalledWith(record);
      expect(mockParseRushData).toHaveBeenCalledWith(record);
      expect(mockParseRushData).toHaveBeenCalledWith(record);
      
      expect(mockProcessRecord).toHaveBeenNthCalledWith(1, NFLSchema, PassTable, WeeklyStatId, weekly_id, passData);
      expect(mockProcessRecord).toHaveBeenNthCalledWith(2, NFLSchema, RushTable, WeeklyStatId, weekly_id, rushData);
      expect(mockProcessRecord).toHaveBeenNthCalledWith(3, NFLSchema, RecTable, WeeklyStatId, weekly_id, recData);

      mockProcessRecord.mockRestore();
      mockParsePassData.mockRestore();
      mockParseRushData.mockRestore();
      mockParseRecData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParsePassData = jest.spyOn(NFLWeeklyStatOffService.prototype, 'parsePassData').mockImplementation(() => passData);
      const mockParseRushData = jest.spyOn(NFLWeeklyStatOffService.prototype, 'parseRushData').mockImplementation(() => rushData);
      const mockParseRecData = jest.spyOn(NFLWeeklyStatOffService.prototype, 'parseRecData').mockImplementation(() => recData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParsePassData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParsePassData.mockRestore();
      mockParseRushData.mockRestore();
      mockParseRecData.mockRestore();
    });    
  });
});