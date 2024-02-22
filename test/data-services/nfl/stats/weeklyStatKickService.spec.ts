import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';
import * as util from '../../../../src/data-services/nfl/utils/utils';

import type { 
    RawWeeklyStatKickData, 
  } from '../../../../src/interfaces/nfl/nflWeeklyStatsKick';

import {
    NFLSchema,
    PlayerGSIS,
    PlayerTable,
    WeeklyStatId,
    KickTable,
} from '../../../../src/constants/nfl/service.constants';

import { 
    NFLWeeklyStatKickService,
 } from '../../../../src/data-services/nfl/weeklyStatKickService';

import {
    configData,
    dataFile,
    kickData,
    rawWeeklyStatKickData as data,
    statBioData as bioData,
    statLeagueData as leagueData,
    weeklyStatKickRecord,
    weeklyKickGameData as gameData,
    weeklyPlayerData as playerData,
    
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
let service: NFLWeeklyStatKickService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLWeeklyStatKickService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
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
    it('should parse successfully', () => {
      const result = playerData
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(weeklyStatKickRecord)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(weeklyStatKickRecord.short_name, '.');
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(weeklyStatKickRecord)).toEqual(result);
    });
  });

  describe('parseBioData', () => {
    it('should parse successfully', () => {
        const result = bioData;
        result.player_id = 0;
        result.headshot_url = '';
        expect(service.parseBioData(weeklyStatKickRecord)).toEqual(result);
    });
  });

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        result.position = 'K';
        result.position_group = 'K';
        expect(service.parseLeagueData(weeklyStatKickRecord)).toEqual(result);
    });
  });

  describe('parseKickData', () => {
    it.each([
        [null, null],
        [1, 1],
    ])('should parse successfully - fg_pct: %s, pat_pct: %s', (fg_pct, pat_pct) => {
        const result = kickData;
        result.player_weekly_id = 0;

        const data: RawWeeklyStatKickData = weeklyStatKickRecord;
        data.fg_pct = fg_pct;
        data.pat_pct = pat_pct;

        result.fg_pct = (fg_pct) ? data.fg_pct : 0;
        result.pat_pct = (pat_pct) ? data.pat_pct : 0;
        expect(service.parseKickData(data)).toEqual(result);
    });
  });

  describe('processKickRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseKickData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parseKickData').mockImplementation(() => kickData);
      
      const weekly_id = weeklyStatKickRecord.player_weekly_id;
      await service.processKickRecord(weekly_id, weeklyStatKickRecord);
      
      expect(mockParseKickData).toHaveBeenCalledWith(weeklyStatKickRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, KickTable, WeeklyStatId, weekly_id, kickData);

      mockProcessRecord.mockRestore();
      mockParseKickData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseKickData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parseKickData').mockImplementation(() => kickData);

      await expect(service.processKickRecord(1, weeklyStatKickRecord)).rejects.toThrow(error);
      expect(mockParseKickData).toHaveBeenCalledWith(weeklyStatKickRecord);
      
      mockProcessRecord.mockRestore();
      mockParseKickData.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyStatKickRecord],
      [1001, false, weeklyStatKickRecord],
    ])('should run successfully - id: %s, insert: %s', async (player_id, bInsert, row) => {
      let id = player_id;
      const weekly_id = row.player_weekly_id;

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessBioRecord = jest.spyOn(NFLWeeklyStatKickService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLWeeklyStatKickService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessKickRecord = jest.spyOn(NFLWeeklyStatKickService.prototype, 'processKickRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`,
          LogContext.NFLWeeklyStatKickService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessKickRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatKickService);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessKickRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyStatKickRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyStatKickRecord);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatKickService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyStatKickRecord.player_weekly_id));
      const mockProcessKickRecord = jest.spyOn(NFLWeeklyStatKickService.prototype, 'processKickRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyStatKickRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessKickRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Kick Stat Service started...', LogContext.NFLWeeklyStatKickService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Kick Stat Service started...', LogContext.NFLWeeklyStatKickService)
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Kick Stat Service did not complete', error.message, LogContext.NFLWeeklyStatKickService)

      mockRunService.mockRestore();
    });
  });
});