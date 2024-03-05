import * as cd from '@config/configData';
import * as util from '@utils/utils';

import { Config } from '@interfaces/config/config';
import {
  configData,
  rawWeeklyStatKickData as data,
  statBioData as bioData,
  statLeagueData as leagueData,
  weeklyStatKickRecord as record,
  weeklyKickGameData as gameData,
  weeklyPlayerData as playerData,
  weeklyKickData as testData,
} from '@test-nfl-constants/config.constants';
import { DBService } from '@database/dbService';
import {
  NFLSchema,
  WeeklyKickTable as DBTable,
  WeeklyStatId as DBId,
} from '@constants/nfl/service.constants';
import { NFLWeeklyStatKickService } from '@data-services/nfl/weeklyStats/weeklyStatKickService';

import type { RawWeeklyStatKickData } from '@interfaces/nfl/weeklyStats/weeklyStatsKick';
import type { StringSplitResult } from '@data-services/utils/utils';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let service: NFLWeeklyStatKickService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLWeeklyStatKickService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    service = new NFLWeeklyStatKickService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_kick_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_kick_stats.urls);
    });
  });

  describe('parsePlayerData', () => {
    const { short_name, ...noShortName } = record;

    it.each([
      [1, record],
      [2, noShortName],
    ])('should parse successfully - idx: %s', (idx, record: RawWeeklyStatKickData) => {
      const result = playerData
      result.short_name = record.short_name;
      result.full_name = record.short_name ?? '';
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(record)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(result.short_name, '.');
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(record)).toEqual(result);
    });
  });

  describe('parseBioData', () => {
    it('should parse successfully', () => {
        const result = bioData;
        result.player_id = 0;
        result.headshot_url = '';
        expect(service.parseBioData(record)).toEqual(result);
    });
  });

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        result.position = 'K';
        result.position_group = 'K';
        expect(service.parseLeagueData(record)).toEqual(result);
    });
  });

  describe('parseStatData', () => {
    it('should parse successfully', () => {
      const mockParseNumber = jest.spyOn(util, 'parseNumber').mockImplementation(() => 0);

      const result = service.parseStatData(record);
      expect(result.player_weekly_id).toEqual(0);
      expect(mockParseNumber).toHaveBeenCalledTimes(31);
      expect(mockParseNumber).toHaveBeenNthCalledWith(1, record.fg_made);
      expect(mockParseNumber).toHaveBeenNthCalledWith(2, record.fg_missed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(3, record.fg_blocked);
      expect(mockParseNumber).toHaveBeenNthCalledWith(4, record.fg_long);
      expect(mockParseNumber).toHaveBeenNthCalledWith(5, record.fg_att);
      expect(mockParseNumber).toHaveBeenNthCalledWith(6, record.fg_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(7, record.pat_made);
      expect(mockParseNumber).toHaveBeenNthCalledWith(8, record.pat_missed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(9, record.pat_blocked);
      expect(mockParseNumber).toHaveBeenNthCalledWith(10, record.pat_att);
      expect(mockParseNumber).toHaveBeenNthCalledWith(11, record.pat_pct);
      expect(mockParseNumber).toHaveBeenNthCalledWith(12, record.fg_made_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(13, record.fg_missed_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(14, record.fg_blocked_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(15, record.gwfg_att);
      expect(mockParseNumber).toHaveBeenNthCalledWith(16, record.gwfg_distance);
      expect(mockParseNumber).toHaveBeenNthCalledWith(17, record.gwfg_made);
      expect(mockParseNumber).toHaveBeenNthCalledWith(18, record.gwfg_missed);
      expect(mockParseNumber).toHaveBeenNthCalledWith(19, record.gwfg_blocked);
      expect(mockParseNumber).toHaveBeenNthCalledWith(20, record.fg_made_0_19);
      expect(mockParseNumber).toHaveBeenNthCalledWith(21, record.fg_made_20_29);
      expect(mockParseNumber).toHaveBeenNthCalledWith(22, record.fg_made_30_39);
      expect(mockParseNumber).toHaveBeenNthCalledWith(23, record.fg_made_40_49);
      expect(mockParseNumber).toHaveBeenNthCalledWith(24, record.fg_made_50_59);
      expect(mockParseNumber).toHaveBeenNthCalledWith(25, record.fg_made_60_);
      expect(mockParseNumber).toHaveBeenNthCalledWith(26, record.fg_missed_0_19);
      expect(mockParseNumber).toHaveBeenNthCalledWith(27, record.fg_missed_20_29);
      expect(mockParseNumber).toHaveBeenNthCalledWith(28, record.fg_missed_30_39);
      expect(mockParseNumber).toHaveBeenNthCalledWith(29, record.fg_missed_40_49);
      expect(mockParseNumber).toHaveBeenNthCalledWith(30, record.fg_missed_50_59);
      expect(mockParseNumber).toHaveBeenNthCalledWith(31, record.fg_missed_60_);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseStatData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parseStatData').mockImplementation(() => testData);
      
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
      const mockParseStatData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parseStatData').mockImplementation(() => testData);

      await expect(service.processStatRecord(1, record)).rejects.toThrow(error);
      expect(mockParseStatData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseStatData.mockRestore();
    });    
  });
});