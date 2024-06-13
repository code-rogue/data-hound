import * as cd from '@config/configData';
import * as util from '@utils/utils';

import { Config } from '@interfaces/config/config';
import {
  configData,
  defData as testData,
  weeklyStatDefRecord as record,
} from '@test-nfl-constants/config.constants';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import {
  NFLSchema,
  WeeklyDefTable as DBTable,
  WeeklyStatId as DBId,
  CalcSeasonStats,
  CalcSeasonDefStats,
} from '@constants/nfl/service.constants';
import { NFLWeeklyStatDefService } from '@data-services/nfl/weeklyStats/weeklyStatDefService';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyStatDefService;

describe('NFLWeeklyStatDefService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyStatDefService();
  });
  
  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_def_stats.columns);
        expect(service.logContext).toEqual(LogContext.NFLWeeklyStatDefService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyStatDefService);
        expect(service.urls).toEqual(configData.nfl.player_weekly_def_stats.urls);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(22);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.tackles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.tackles_solo);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.tackle_with_assists);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.tackle_assists);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.tackles_for_loss);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.tackles_for_loss_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.fumbles_forced);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.sacks);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.sack_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.qb_hits);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.interceptions);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.interception_yards);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.pass_defended);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.tds);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.fumbles);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.fumble_recovery_own);
      expect(mockParseNumber).toHaveBeenNthCalledWith(17, record.fumble_recovery_yards_own);
      expect(mockParseNumber).toHaveBeenNthCalledWith(18, record.fumble_recovery_opp);
      expect(mockParseNumber).toHaveBeenNthCalledWith(19, record.fumble_recovery_yards_opp);
      expect(mockParseNumber).toHaveBeenNthCalledWith(20, record.safety);
      expect(mockParseNumber).toHaveBeenNthCalledWith(21, record.penalty);
      expect(mockParseNumber).toHaveBeenNthCalledWith(22, record.penalty_yards);
    });
  });

  describe('processProcedures', () => {
    it('should call the procedures', async () => {
      const mockCallProcedure = jest.spyOn(DBService.prototype, 'callProcedure').mockImplementation();

      await service.processProcedures();
      expect(mockCallProcedure).toHaveBeenNthCalledWith(1, NFLSchema, CalcSeasonStats);
      expect(mockCallProcedure).toHaveBeenNthCalledWith(2, NFLSchema, CalcSeasonDefStats);

      mockCallProcedure.mockRestore();
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyStatDefService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyStatDefService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});