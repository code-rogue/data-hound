import * as cd from '@config/configData';
import * as util from '@utils/utils';

import { Config } from '@interfaces/config/config';
import {
  configData,
  seasonAdvStatBaseRecord as baseRecord,
  seasonAdvStatData as seasonData,
  seasonAdvStatLeagueData as leagueData,
  seasonAdvStatPlayerData as playerData,
  seasonAdvStatRecord as record,   
} from '@test-nfl-constants/config.constants';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import {
  NFLSchema,
  PlayerId,
  PlayerTable,
  SeasonStatTable,
} from '@constants/nfl/service.constants';
import { NFLSeasonAdvStatService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatService';
import { NFLStatService } from '@data-services/nfl/statService';
import { ServiceName } from '@constants/nfl/service.constants';

import type { SeasonData } from '@interfaces/nfl/stats';
import type { StringSplitResult } from '@data-services/utils/utils';

jest.mock('@log/logger');

let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let service: NFLSeasonAdvStatService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLSeasonAdvStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    service = new NFLSeasonAdvStatService();
  });

  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual({});
        expect(service.logContext).toEqual(LogContext.NFLSeasonAdvStatService);
        expect(service.serviceName).toEqual(ServiceName.NFLSeasonAdvStatService);
        expect(service.urls).toEqual([]);
    });
  });

  describe('parsePlayerData', () => {
    it('should parse successfully', () => {
      const result = playerData
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(record)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(record.full_name, ' ');
    });
  });

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(record)).toEqual(result);
    });
  });

  describe('parseSeasonData', () => {
    const {age, games_played, games_started, ...seasonBaseData} = seasonData;

    it.each([
      [baseRecord],
      [record],
    ])
    ('should parse successfully', (data: SeasonData) => {
        const result = seasonData;
        result.player_id = 0;
        result.age = data.age ?? 0;
        result.games_played = data.games_played ?? 0;
        result.games_started = data.games_started ?? 0;
        expect(service.parseSeasonData(data)).toEqual(result);
    });
  });

  describe('processSeasonRecord', () => {
    it.each([
      [true, record, { id: record.player_season_id }],
      [false, record, { id: 0 }],
      [false, record, undefined],
    ])('should run successfully - exists: "%s"', async (exists, row, statRecord) => {
      const player_id = row.player_id;
      const season_id = record.player_season_id;
      const query = `SELECT id FROM ${NFLSchema}.${SeasonStatTable} WHERE ${PlayerId} = $1 AND season = $2`;
      const keys = [player_id, record.season];

      const mockParseSeasonData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parseSeasonData').mockImplementation(() => seasonData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords')
        .mockImplementation(() => Promise.resolve( (statRecord?.id) ? [statRecord] : undefined));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(row.player_season_id));

      const result = await service.processSeasonRecord(player_id, row);
      expect(result).toEqual(season_id);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);
      if (exists) {
        const { player_id, ...updatedData } = seasonData;
        expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, SeasonStatTable, 'id', season_id, updatedData);
      } 
      else {
        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, SeasonStatTable, seasonData);
      }

      mockParseSeasonData.mockRestore();
      mockFetchRecords.mockRestore();
      mockUpdateRecord.mockRestore();
      mockInsertRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseSeasonData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parseSeasonData').mockImplementation(() => seasonData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.processSeasonRecord(1, record)).rejects.toThrow(error);
      expect(mockParseSeasonData).toHaveBeenCalledWith(record);
      mockParseSeasonData.mockRestore();
      mockFetchRecords.mockRestore();
    });    
  });

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, record],
      [1001, false, record],
    ])('should run successfully - id: %s, insert: %s', async (player_id, bInsert, row) => {
      let id = player_id;
      const season_id = row.player_season_id;

      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayerByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessSeasonRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processSeasonRecord')
        .mockImplementation(() => Promise.resolve(season_id));
      const mockProcessStatRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockFindPlayerByPFR).toHaveBeenCalledWith(playerData);

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.pfr_id}].`, service.logContext);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessSeasonRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessStatRecord).toHaveBeenCalledWith(season_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, service.logContext);

      mockParsePlayerData.mockRestore();
      mockFindPlayerByPFR.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessSeasonRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayerByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockFindPlayerByPFR.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayerByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockImplementation(() => Promise.resolve(1));

      const mockProcessSeasonRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processSeasonRecord')
        .mockImplementation(() => Promise.resolve(record.player_season_id));
      const mockProcessStatRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayerByPFR.mockRestore();
      mockProcessSeasonRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`, service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`,service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(`${service.serviceName} did not complete`, error.message, service.logContext);

      mockRunService.mockRestore();
    });
  });
});