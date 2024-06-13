import * as cd from '@config/configData';
import * as team from '@utils/teamUtils';
import {
  BioTable,
  NFLSchema,
  PlayerId,
  WeeklyStatTable,
} from '@constants/nfl/service.constants';
import { Config } from '@interfaces/config/config';
import {
  configData,
  statRecord as record,
  statGameData as gameData,
  statBioData as bioData,
  weeklyPlayerData as playerData,
} from '@test-nfl-constants/config.constants';
import { DBService } from '@database/dbService'
import { GameData, PlayerData } from '@interfaces/nfl/stats';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService'
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
import { ServiceName } from '@constants/nfl/service.constants';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockTeamLookup: jest.SpyInstance<number | null, [teamName?: string | undefined], any>;
let service: NFLWeeklyStatService;

describe('NFLWeeklyStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockTeamLookup = jest.spyOn(team, 'teamLookup').mockImplementation(() => 5);
    service = new NFLWeeklyStatService();
  });

  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual({});
        expect(service.logContext).toEqual(LogContext.NFLWeeklyStatService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyStatService);
        expect(service.urls).toEqual([]);
    });
  });

  describe('parseBioData', () => {
    it('should parse successfully', () => {
        const result = bioData;
        result.player_id = 0;
        expect(service.parseBioData(record)).toEqual(result);
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        // remove the team column
        const {team, ...result}: GameData = gameData;
        result.player_id = 0;
        expect(service.parseGameData(record)).toEqual(result);
        expect(mockTeamLookup).toHaveBeenCalledWith(record.team);
    });
  });

  describe('processBioRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseBioData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseBioData').mockImplementation(() => bioData);
      
      const player_id = record.player_id;
      await service.processBioRecord(player_id, record);
      
      expect(mockParseBioData).toHaveBeenCalledWith(record);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id, bioData);

      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseBioData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseBioData').mockImplementation(() => bioData);

      await expect(service.processBioRecord(1, record)).rejects.toThrow(error);
      expect(mockParseBioData).toHaveBeenCalledWith(record);
      
      mockProcessRecord.mockRestore();
      mockParseBioData.mockRestore();
    });    
  });

  describe('processGameRecord', () => {
    it.each([
      [true, record, { id: record.player_weekly_id }],
      [false, record, { id: 0 }],
      [false, record, undefined],
    ])('should run successfully - exists: "%s"', async (exists, row, fetchedRecord) => {
      const player_id = row.player_id;
      const weekly_id = record.player_weekly_id;

      const query = `SELECT id FROM ${NFLSchema}.${WeeklyStatTable} WHERE ${PlayerId} = $1 AND season = $2 AND week = $3`;
      const keys = [player_id, gameData.season, gameData.week];

      const mockParseGameData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords')
        .mockImplementation(() => Promise.resolve( (fetchedRecord?.id) ? [fetchedRecord] : undefined));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(row.player_weekly_id));

      const result = await service.processGameRecord(player_id, row);
      expect(result).toEqual(weekly_id);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);

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

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseGameData = jest.spyOn(NFLWeeklyStatService.prototype, 'parseGameData').mockImplementation(() => gameData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.processGameRecord(1, record)).rejects.toThrow(error);
      expect(mockParseGameData).toHaveBeenCalledWith(record);
      mockParseGameData.mockRestore();
      mockFetchRecords.mockRestore();
    });    
  });

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    const noGSIS = {
      full_name: 'Travis Kelce',
    } as PlayerData;

    const blankGSIS = {
      full_name: 'Travis Kelce',
      gsis_id: '',
    } as PlayerData;

    const fullPlayerRecord = {
      full_name: 'Travis Kelce',
      gsis_id: 'string',
    } as PlayerData;

    it.each([
      [0, 0, fullPlayerRecord],
      [1001, 0, noGSIS],
      [1002, 1, blankGSIS],
      [1003, 0, fullPlayerRecord],
      [1004, 1, fullPlayerRecord],
    ])('should run successfully - player_id: %s, week_id: %s', async (player_id, weekly_id, data) => {
      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => data);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByGSIS')
        .mockReturnValue(Promise.resolve(player_id));

      const mockProcessBioRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(record);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      
      if (!data.gsis_id || data.gsis_id === '') {
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing GSIS Id: ${JSON.stringify(data)}.`, service.logContext);
      } else {
        expect(mockFindPlayer).toHaveBeenCalledWith(data);

        if (player_id === 0) {
          expect(logger.notice).toHaveBeenCalledWith(`No Player Found: ${data.full_name} [${data.gsis_id}].`, service.logContext);
          expect(mockProcessBioRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessLeagueRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessGameRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          expect(logger.debug).toHaveBeenCalledTimes(1);
        } else {
          expect(mockProcessBioRecord).toHaveBeenCalledWith(player_id, record);
          expect(mockProcessLeagueRecord).toHaveBeenCalledWith(player_id, record);
          expect(mockProcessGameRecord).toHaveBeenCalledWith(player_id, record);
          if (weekly_id === 0) {
            expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          } else {
            expect(mockProcessStatRecord).toHaveBeenCalledWith(weekly_id, record);
          }

          expect(logger.debug).toHaveBeenNthCalledWith(2,`Completed processing player record: ${JSON.stringify(record)}.`, service.logContext);
        }
      }

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByGSIS').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it.skip('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByGSIS').mockImplementation(() => Promise.resolve(1));

      const mockProcessBioRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processLeagueRecord').mockImplementation();
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(1));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`,service.logContext);
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