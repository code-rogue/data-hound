import * as cd from '@config/configData';
import * as util from '@utils/utils';

import {
  advStatRecord as record,
  advStatGameData as gameData,
  advStatLeagueData as leagueData,
  advStatPlayerData as playerData,
  configData,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService';
import { NFLWeeklyAdvStatService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatService';
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
import {
  NFLSchema,
  PlayerTable,
} from '@constants/nfl/service.constants';
import { ServiceName } from '@constants/nfl/service.constants';


import type {
  StringSplitResult,
} from '@data-services/utils/utils';

jest.mock('@log/logger');

let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let service: NFLWeeklyAdvStatService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLWeeklyAdvStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    service = new NFLWeeklyAdvStatService();
  });

  describe('Constructor', () => {
    it('should set members', () => {
        expect(service.columns).toEqual({});
        expect(service.logContext).toEqual(LogContext.NFLWeeklyAdvStatService);
        expect(service.serviceName).toEqual(ServiceName.NFLWeeklyAdvStatService);
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

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(record)).toEqual(result);
    });
  });
  
  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(record)).toEqual(result);
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
      const weekly_id = row.player_weekly_id;

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayerByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockFindPlayerByPFR).toHaveBeenCalledWith(playerData);

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.pfr_id}].`,
        service.logContext);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessStatRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, service.logContext);

      mockParsePlayerData.mockRestore();
      mockFindPlayerByPFR.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayerByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockFindPlayerByPFR.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayerByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(record.player_weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayerByPFR.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLWeeklyStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`, service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLWeeklyStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(`${service.serviceName} started...`, service.logContext);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(`${service.serviceName} did not complete`, error.message, service.logContext);

      mockRunService.mockRestore();
    });
  });
});