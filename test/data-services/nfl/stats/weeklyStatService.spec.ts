import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';
import * as util from '../../../../src/data-services/nfl/utils/utils';

import type { 
    RawWeeklyStatData, 
  } from '../../../../src/interfaces/nfl/nflWeeklyStats';

import {
    NFLSchema,
    PassTable,
    PlayerGSIS,
    PlayerTable,
    RecTable,
    RushTable,
    WeeklyStatId,
} from '../../../../src/constants/nfl/service.constants';

import { 
    NFLWeeklyStatService,
 } from '../../../../src/data-services/nfl/weeklyStatService';

import {
    configData,
    dataFile,
    weeklyStatRecord,
    rawWeeklyStatData as data,
    weeklyGameData as gameData,
    weeklyPlayerData as playerData,
    passData,
    rushData,
    recData,
} from '../constants/config.constants';

import type {
  StringSplitResult,
} from '../../../../src/data-services/nfl/utils/utils';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null, delimiter: string], any>;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let service: NFLWeeklyStatService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLWeeklyStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    service = new NFLWeeklyStatService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_stats.urls);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(weeklyStatRecord)).toEqual(result);
    });
  });

  describe('parsePassData', () => {
    it.each([
        [null, null, null, null, null, null, null, null],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ])('should parse successfully - yards %s', (yards, yards_after, air_yards, air_ratio, dakota, epa, sacks, sack_yards) => {
        const result = passData;
        result.player_weekly_id = 0;

        const data: RawWeeklyStatData = weeklyStatRecord;
        data.pass_yards = yards;
        data.pass_yards_after_catch = yards_after;
        data.pass_air_yards = air_yards;
        data.pass_air_conversion_ratio = air_ratio;
        data.dakota = dakota;
        data.pass_epa = epa;
        data.sacks = sacks;
        data.sack_yards = sack_yards;

        result.pass_yards = (yards) ? data.pass_yards : 0;
        result.pass_yards_after_catch = (yards_after) ? data.pass_yards_after_catch : 0;
        result.pass_air_yards = (air_yards) ? data.pass_air_yards : 0;
        result.pass_air_conversion_ratio = (air_ratio) ? data.pass_air_conversion_ratio : 0;
        result.dakota = (dakota) ? data.dakota : 0;
        result.pass_epa = (epa) ? data.pass_epa : 0;
        result.sacks = (sacks) ? data.sacks : 0;
        result.sack_yards = (sack_yards) ? data.sack_yards : 0;
        expect(service.parsePassData(data)).toEqual(result);
    });
  });

  describe('parseRushData', () => {
    it.each([
        [null, null],
        [1, 1],
    ])('should parse successfully', (yards, epa) => {
        const result = rushData;
        result.player_weekly_id = 0;

        const data: RawWeeklyStatData = weeklyStatRecord;
        data.rush_yards = yards;
        data.rush_epa = epa;

        result.rush_yards = (yards) ? data.rush_yards : 0;
        result.rush_epa = (epa) ? data.rush_epa : 0;
        expect(service.parseRushData(data)).toEqual(result);
    });
  });

  describe('parseRecData', () => {
    it.each([
        [null, null, null, null, null, null, null, null],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ])('should parse successfully', (target_share, yards, yards_after, air_yards, air_share, air_ratio, wopr, epa) => {
        const result = recData;
        result.player_weekly_id = 0;

        const data: RawWeeklyStatData = weeklyStatRecord;
        data.target_share = target_share;
        data.rec_yards = yards;
        data.rec_yards_after_catch = yards_after;
        data.rec_air_yards = air_yards;
        data.rec_air_yards_share = air_share;
        data.rec_air_conversion_ratio = air_ratio;
        data.weighted_opportunity_rating = wopr;
        data.rec_epa = epa;

        result.target_share = (target_share) ? data.target_share : 0;
        result.rec_yards = (yards) ? data.rec_yards : 0;
        result.rec_yards_after_catch = (yards_after) ? data.rec_yards_after_catch : 0;
        result.rec_air_yards = (air_yards) ? data.rec_air_yards : 0;
        result.rec_air_yards_share = (air_share) ? data.rec_air_yards_share : 0;
        result.rec_air_conversion_ratio = (air_ratio) ? data.rec_air_conversion_ratio : 0;
        result.weighted_opportunity_rating = (wopr) ? data.weighted_opportunity_rating : 0;
        result.rec_epa = (epa) ? data.rec_epa : 0;
        expect(service.parseRecData(data)).toEqual(result);
    });
  });

  describe('processPassRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParsePassData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePassData').mockImplementation(() => passData);
      
      const weekly_id = weeklyStatRecord.player_weekly_id;
      await service.processPassRecord(weekly_id, weeklyStatRecord);
      
      expect(mockParsePassData).toHaveBeenCalledWith(weeklyStatRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, PassTable, WeeklyStatId, weekly_id, passData);

      mockProcessRecord.mockRestore();
      mockParsePassData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParsePassData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePassData').mockImplementation(() => passData);

      await expect(service.processPassRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParsePassData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParsePassData.mockRestore();
    });    
  });

  describe('processRushRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseRushData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseRushData').mockImplementation(() => rushData);
      
      const weekly_id = weeklyStatRecord.player_weekly_id;
      await service.processRushRecord(weekly_id, weeklyStatRecord);
      
      expect(mockParseRushData).toHaveBeenCalledWith(weeklyStatRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, RushTable, WeeklyStatId, weekly_id, rushData);

      mockProcessRecord.mockRestore();
      mockParseRushData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseRushData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseRushData').mockImplementation(() => rushData);

      await expect(service.processRushRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseRushData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParseRushData.mockRestore();
    });    
  });

  describe('processRecRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseRecData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseRecData').mockImplementation(() => recData);
      
      const weekly_id = weeklyStatRecord.player_weekly_id;
      await service.processRecRecord(weekly_id, weeklyStatRecord);
      
      expect(mockParseRecData).toHaveBeenCalledWith(weeklyStatRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, RecTable, WeeklyStatId, weekly_id, recData);

      mockProcessRecord.mockRestore();
      mockParseRecData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseRecData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseRecData').mockImplementation(() => recData);

      await expect(service.processRecRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseRecData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParseRecData.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyStatRecord],
      [1001, false, weeklyStatRecord],
    ])('should run successfully - id: %s, insert: %s', async (player_id, bInsert, row) => {
      let id = player_id;
      const weekly_id = row.player_weekly_id;

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessBioRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessPassRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processPassRecord').mockImplementation();
      const mockProcessRushRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRushRecord').mockImplementation();
      const mockProcessRecRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`,
          LogContext.NFLWeeklyStatService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessPassRecord).toHaveBeenCalledWith(weekly_id, row);
      expect(mockProcessRushRecord).toHaveBeenCalledWith(weekly_id, row);
      expect(mockProcessRecRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatService);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessPassRecord.mockRestore();
      mockProcessRushRecord.mockRestore();
      mockProcessRecRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyStatRecord);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyStatRecord.player_weekly_id));
      const mockProcessPassRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processPassRecord').mockRejectedValue(error);
      const mockProcessRushRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRushRecord').mockImplementation();
      const mockProcessRecRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecRecord').mockImplementation();

      await expect(service.processPlayerDataRow(weeklyStatRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessPassRecord.mockRestore();
      mockProcessRushRecord.mockRestore();
      mockProcessRecRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Stat Service started...', LogContext.NFLWeeklyStatService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Stat Service started...', LogContext.NFLWeeklyStatService)
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Stat Service did not complete', error.message, LogContext.NFLWeeklyStatService)

      mockRunService.mockRestore();
    });
  });
});