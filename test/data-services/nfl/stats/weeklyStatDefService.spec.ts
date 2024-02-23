import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { NFLWeeklyStatDefService } from '../../../../src/data-services/nfl/weeklyStatDefService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
    DefTable,
    NFLSchema,
    PlayerGSIS,
    PlayerTable,
    WeeklyStatId,
} from '../../../../src/constants/nfl/service.constants';

import { 
    NFLWeeklyStatService,
 } from '../../../../src/data-services/nfl/weeklyStatService';

import {
    configData,
    dataFile,
    defData,
    rawStatData as data,
    statGameData as gameData,
    statPlayerData as playerData,
    statRecord,
    weeklyStatDefRecord,
} from '../constants/config.constants';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let service: NFLWeeklyStatDefService;

describe('NFLWeeklyStatDefService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyStatDefService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_def_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_def_stats.urls);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(statRecord)).toEqual(result);
    });
  });

  describe('parseDefData', () => {
    it('should parse successfully', () => {
        const result = defData;
        result.player_weekly_id = 0;
        expect(service.parseDefData(weeklyStatDefRecord)).toEqual(result);
    });
  });
  
  describe('processDefRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseRecData = jest.spyOn(NFLWeeklyStatDefService.prototype, 'parseDefData').mockImplementation(() => defData);
      
      const weekly_id = weeklyStatDefRecord.player_weekly_id;
      await service.processDefRecord(weekly_id, weeklyStatDefRecord);
      
      expect(mockParseRecData).toHaveBeenCalledWith(weeklyStatDefRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, DefTable, WeeklyStatId, weekly_id, defData);

      mockProcessRecord.mockRestore();
      mockParseRecData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseRecData = jest.spyOn(NFLWeeklyStatDefService.prototype, 'parseDefData').mockImplementation(() => defData);

      await expect(service.processDefRecord(1, weeklyStatDefRecord)).rejects.toThrow(error);
      expect(mockParseRecData).toHaveBeenCalledWith(weeklyStatDefRecord);
      
      mockProcessRecord.mockRestore();
      mockParseRecData.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyStatDefRecord],
      [1001, false, weeklyStatDefRecord],
    ])('should run successfully - id: %s, insert: %s', async (player_id, bInsert, row) => {
      let id = player_id;
      const weekly_id = row.player_weekly_id;

      const mockParsePlayerData = jest.spyOn(NFLStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessBioRecord = jest.spyOn(NFLStatService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessDefRecord = jest.spyOn(NFLWeeklyStatDefService.prototype, 'processDefRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerGSIS, playerData.gsis_id, 'id');

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.gsis_id}].`,
          LogContext.NFLWeeklyStatDefService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessDefRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyStatDefService);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessDefRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyStatDefRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyStatDefRecord);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyStatDefRecord.player_weekly_id));
      const mockProcessDefRecord = jest.spyOn(NFLWeeklyStatDefService.prototype, 'processDefRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyStatDefRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessDefRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Def Stat Service started...', LogContext.NFLWeeklyStatDefService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Def Stat Service started...', LogContext.NFLWeeklyStatDefService)
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Def Stat Service did not complete', error.message, LogContext.NFLWeeklyStatDefService)

      mockRunService.mockRestore();
    });
  });
});