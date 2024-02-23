import * as cd from '../../../../src/config/configData';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { NFLWeeklyAdvStatService } from '../../../../src/data-services/nfl/advStatService'
import { NFLWeeklyAdvStatRecService } from '../../../../src/data-services/nfl/weeklyAdvStatRecService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
    AdvRecTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../../../src/constants/nfl/service.constants';

import {
    advRecData,
    configData,
    statPlayerData as playerData,
    weeklyAdvStatRecRecord,
} from '../constants/config.constants';

import type { 
    RawWeeklyAdvStatRecData, 
} from '../../../../src/interfaces/nfl/weeklyAdvStatsRec';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatRecService;

describe('NFLWeeklyAdvStatRecService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatRecService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_rec_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_rec_stats.urls);
    });
  });

  describe('parseAdvRecData', () => {
    it.each([
        [null, null, null, null, null],
        [1, 1, 1, 1, 1],
    ])('should parse successfully - yards %s', (tackles, drops, drop_pct, int, qb_rtaing) => {
        const result = advRecData;
        result.player_weekly_id = 0;

        const data: RawWeeklyAdvStatRecData = weeklyAdvStatRecRecord;
        data.broken_tackles = tackles;
        data.drops = drops;
        data.drop_pct = drop_pct;
        data.interceptions = int;
        data.qb_rating = qb_rtaing;

        result.broken_tackles = (tackles) ? data.broken_tackles : 0;
        result.drops = (drops) ? data.drops : 0;
        result.drop_pct = (drop_pct) ? data.drop_pct : 0;
        result.interceptions = (int) ? data.interceptions : 0;
        result.qb_rating = (qb_rtaing) ? data.qb_rating : 0;
        expect(service.parseAdvRecData(data)).toEqual(result);
    });
  });

  describe('processAdvRecRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockProcessAdvRecRecord = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'parseAdvRecData').mockImplementation(() => advRecData);
      
      const weekly_id = weeklyAdvStatRecRecord.player_weekly_id;
      await service.processAdvRecRecord(weekly_id, weeklyAdvStatRecRecord);
      
      expect(mockProcessAdvRecRecord).toHaveBeenCalledWith(weeklyAdvStatRecRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, AdvRecTable, WeeklyStatId, weekly_id, advRecData);

      mockProcessRecord.mockRestore();
      mockProcessAdvRecRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockProcessAdvRecRecord = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'parseAdvRecData').mockImplementation(() => advRecData);

      await expect(service.processAdvRecRecord(1, weeklyAdvStatRecRecord)).rejects.toThrow(error);
      expect(mockProcessAdvRecRecord).toHaveBeenCalledWith(weeklyAdvStatRecRecord);
      
      mockProcessRecord.mockRestore();
      mockProcessAdvRecRecord.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyAdvStatRecRecord],
      [1001, false, weeklyAdvStatRecRecord],
    ])('should run successfully - id: %s, insert: %s', async (player_id, bInsert, row) => {
      let id = player_id;
      const weekly_id = row.player_weekly_id;

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessAdvRecRecord = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'processAdvRecRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData);

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.pfr_id}].`,
          LogContext.NFLWeeklyAdvStatRecService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessAdvRecRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatRecService);

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvRecRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatRecRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyAdvStatRecRecord);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyAdvStatRecRecord.player_weekly_id));
      const mockProcessAdvRecRecord = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'processAdvRecRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatRecRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvRecRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Rec Stat Service started...', LogContext.NFLWeeklyAdvStatRecService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Rec Stat Service started...', LogContext.NFLWeeklyAdvStatRecService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Adv Rec Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatRecService);

      mockRunService.mockRestore();
    });
  });
});