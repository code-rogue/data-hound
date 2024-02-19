import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';
import * as util from '../../../../src/data-services/nfl/utils/utils';

import type { 
    RawWeeklyStatData, 
  } from '../../../../src/interfaces/nfl/nflPlayerWeeklyStats';

import {
    NFLSchema,
    BioTable,
    LeagueTable,
    PassTable,
    //PlayerTable,
    WeeklyStatTable,
    RecTable,
    RushTable,
    PlayerId,
} from '../../../../src/constants/nfl/service.constants';

import { 
    NFLWeeklyStatService,
    //PlayerGUID,
    WeeklyStatId,
 } from '../../../../src/data-services/nfl/weeklyStatService';

import {
    configData,
    dataFile,
    noRawWeeklyStatData as noData,
    weeklyStatRecord,
    rawWeeklyStatData as data,
    gameData,
    weeklyPlayerData as playerData,
    weeklyLeagueData as leagueData,
    weeklyBioData as bioData,
    passData,
    rushData,
    recData,
} from '../constants/config.constants';

import type { 
    RecordData,
} from '../../../../src/interfaces/nfl/nflPlayerWeeklyStats';

import type {
  StringSplitResult,
} from '../../../../src/data-services/nfl/utils/utils';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV;
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

  describe('processPlayerData', () => {
    it.each([
      [noData],
      [data],
      [[weeklyStatRecord, weeklyStatRecord]],
    ])('should run processPlayerData successfully', async (data) => {
      const mockProcessPlayerDataRow = jest.spyOn(NFLWeeklyStatService.prototype, 'processPlayerDataRow').mockImplementation();
      await service.processPlayerData(data);
      
      expect(logger.log).toHaveBeenCalledWith(`Processing player records [${data.length}]`, LogContext.NFLWeeklyStatsService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledTimes(data.length);
      data.forEach(row => {
        expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(row);
      })
      
      expect(logger.log).toHaveBeenCalledWith('Processed player records.', LogContext.NFLWeeklyStatsService);
      mockProcessPlayerDataRow.mockRestore();
    });

    it('processPlayerData should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerDataRow = jest.spyOn(NFLWeeklyStatService.prototype, 'processPlayerDataRow').mockRejectedValue(error);

      await expect(service.processPlayerData(data)).rejects.toThrow(error);

      expect(logger.log).toHaveBeenNthCalledWith(1, `Processing player records [1]`, LogContext.NFLWeeklyStatsService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(weeklyStatRecord);

      mockProcessPlayerDataRow.mockRestore();
    });
  });

  describe('processGameRecord', () => {
    it.each([
      [true, weeklyStatRecord, { id: weeklyStatRecord.player_weekly_id }],
      [false, weeklyStatRecord, { id: 0 }],
      [false, weeklyStatRecord, undefined],
    ])('should run successfully - exists: "%s"', async (exists, row, record) => {
      const player_id = row.player_id;
      const weekly_id = weeklyStatRecord.player_weekly_id;

      const mockParseGameData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords')
        .mockImplementation(() => Promise.resolve( (record?.id) ? [record] : undefined));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(row.player_weekly_id));

      const result = await service.processGameRecord(player_id, row);
      expect(result).toEqual(weekly_id);

      if (exists) {
        const { player_id, ...updatedData } = gameData;
        expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, WeeklyStatTable, 'id', weekly_id, updatedData);
      } 
      else {
        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, WeeklyStatTable, gameData);
      }

      mockParseGameData.mockRestore();
      mockFetchRecords.mockRestore();
      mockUpdateRecord.mockRestore();
      mockInsertRecord.mockRestore();
    });

    it('processGameRecord should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseGameData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.processGameRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseGameData).toHaveBeenCalledWith(weeklyStatRecord);
      mockParseGameData.mockRestore();
      mockFetchRecords.mockRestore();
    });    
  });

  describe('processBioRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation();
      const mockParseBioData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseBioData').mockImplementation(() => bioData);
      
      const player_id = weeklyStatRecord.player_id;
      await service.processBioRecord(player_id, weeklyStatRecord);
      
      expect(mockParseBioData).toHaveBeenCalledWith(weeklyStatRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id, bioData);

      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseBioData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseBioData').mockImplementation(() => bioData);

      await expect(service.processBioRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseBioData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });    
  });

  describe('processLeagueRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation();
      const mockParseLeagueData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);
      
      const player_id = weeklyStatRecord.player_id;
      await service.processLeagueRecord(player_id, weeklyStatRecord);
      
      expect(mockParseLeagueData).toHaveBeenCalledWith(weeklyStatRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, LeagueTable, PlayerId, player_id, leagueData);

      mockProcessRecord.mockRestore();
      mockParseLeagueData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseLeagueData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);

      await expect(service.processLeagueRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseLeagueData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockParseLeagueData.mockRestore();
      mockProcessRecord.mockRestore();
    });    
  });

  describe('processPassRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation();
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
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParsePassData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePassData').mockImplementation(() => passData);

      await expect(service.processPassRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParsePassData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParsePassData.mockRestore();
    });    
  });

  describe('processRushRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation();
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
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseRushData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseRushData').mockImplementation(() => rushData);

      await expect(service.processRushRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseRushData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParseRushData.mockRestore();
    });    
  });

  describe('processRecRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation();
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
      const mockProcessRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseRecData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseRecData').mockImplementation(() => recData);

      await expect(service.processRecRecord(1, weeklyStatRecord)).rejects.toThrow(error);
      expect(mockParseRecData).toHaveBeenCalledWith(weeklyStatRecord);
      
      mockProcessRecord.mockRestore();
      mockParseRecData.mockRestore();
    });    
  });

  describe('processRecord', () => {
    it.each([
        [true, passData, WeeklyStatId, 5],
        [false, bioData, PlayerId, 10],
    ])('should run successfully - exists: %s', async (exists, data, idColumn, id) => {
        const dataCopy = data;
        
        const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation(() => Promise.resolve(exists));
        const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
        const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(100));

        // @ts-ignore: (TS 2345) - idColumn is a keyof data
        const result = await service.processRecord(NFLSchema, PassTable, idColumn, id, dataCopy);
        expect(mockRecordExists).toHaveBeenLastCalledWith(NFLSchema, PassTable, idColumn, id);

        if (exists) {
            // @ts-ignore: (TS 2537) - idColumn is a keyof data
            const { [idColumn]: _, ...updatedData } = dataCopy;
            expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, PassTable, idColumn, id, updatedData);
        } 
        else {
            const updatedData = dataCopy;
            (updatedData as RecordData)[idColumn as keyof RecordData] = id;
            expect(result).toEqual(100);
            expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PassTable, dataCopy);
        }

        mockRecordExists.mockRestore();
        mockUpdateRecord.mockRestore();
        mockInsertRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation().mockRejectedValue(error);

      await expect(service.processRecord(NFLSchema, PassTable, WeeklyStatId, 5, passData)).rejects.toThrow(error);
      
      mockRecordExists.mockRestore();
    });    
  });

  describe('parsePlayerData', () => {
    it('should parse successfully', () => {
      const result = playerData
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(weeklyStatRecord)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(weeklyStatRecord.full_name, ' ');
    });
  });

  describe('parseBioData', () => {
    it('should parse successfully', () => {
        const result = bioData;
        result.player_id = 0;
        expect(service.parseBioData(weeklyStatRecord)).toEqual(result);
    });
  });

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(weeklyStatRecord)).toEqual(result);
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
});