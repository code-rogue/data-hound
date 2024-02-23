import * as cd from '../../../../src/config/configData';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { NFLWeeklyAdvStatService } from '../../../../src/data-services/nfl/advStatService'
import { NFLWeeklyAdvStatRushService } from '../../../../src/data-services/nfl/weeklyAdvStatRushService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
    AdvRushTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../../../src/constants/nfl/service.constants';

import {
    advRushData,
    configData,
    statPlayerData as playerData,
    weeklyAdvStatRushRecord,
} from '../constants/config.constants';

import type { 
    RawWeeklyAdvStatRushData, 
} from '../../../../src/interfaces/nfl/weeklyAdvStatsRush';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatRushService;

describe('NFLWeeklyAdvStatRushService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatRushService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_rush_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_rush_stats.urls);
    });
  });

  describe('parseAdvRushData', () => {
    it.each([
        [null, null, null, null, null],
        [1, 1, 1, 1, 1],
    ])('should parse successfully - yards %s', (yards_before, yards_before_avg, yards_after, yards_after_avg, tackles) => {
        const result = advRushData;
        result.player_weekly_id = 0;

        const data: RawWeeklyAdvStatRushData = weeklyAdvStatRushRecord;
        data.yards_before_contact = yards_before;
        data.yards_before_contact_avg = yards_before_avg;
        data.yards_after_contact = yards_after;
        data.yards_after_contact_avg = yards_after_avg;
        data.broken_tackles = tackles;

        result.yards_before_contact = (yards_before) ? data.yards_before_contact : 0;
        result.yards_before_contact_avg = (yards_before_avg) ? data.yards_before_contact_avg : 0;
        result.yards_after_contact = (yards_after) ? data.yards_after_contact : 0;
        result.yards_after_contact_avg = (yards_after_avg) ? data.yards_after_contact_avg : 0;
        result.broken_tackles = (tackles) ? data.broken_tackles : 0;
        expect(service.parseAdvRushData(data)).toEqual(result);
    });
  });

  describe('processAdvRushRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseAdvRushData = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'parseAdvRushData').mockImplementation(() => advRushData);
      
      const weekly_id = weeklyAdvStatRushRecord.player_weekly_id;
      await service.processAdvRushRecord(weekly_id, weeklyAdvStatRushRecord);
      
      expect(mockParseAdvRushData).toHaveBeenCalledWith(weeklyAdvStatRushRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, AdvRushTable, WeeklyStatId, weekly_id, advRushData);

      mockProcessRecord.mockRestore();
      mockParseAdvRushData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseAdvRushData = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'parseAdvRushData').mockImplementation(() => advRushData);

      await expect(service.processAdvRushRecord(1, weeklyAdvStatRushRecord)).rejects.toThrow(error);
      expect(mockParseAdvRushData).toHaveBeenCalledWith(weeklyAdvStatRushRecord);
      
      mockProcessRecord.mockRestore();
      mockParseAdvRushData.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyAdvStatRushRecord],
      [1001, false, weeklyAdvStatRushRecord],
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
      const mockProcessAdvRushRecord = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'processAdvRushRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData);

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.pfr_id}].`,
          LogContext.NFLWeeklyAdvStatRushService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessAdvRushRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatRushService);

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvRushRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatRushRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyAdvStatRushRecord);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyAdvStatRushRecord.player_weekly_id));
      const mockProcessAdvRushRecord = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'processAdvRushRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatRushRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvRushRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Rush Stat Service started...', LogContext.NFLWeeklyAdvStatRushService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Rush Stat Service started...', LogContext.NFLWeeklyAdvStatRushService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Adv Rush Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatRushService);

      mockRunService.mockRestore();
    });
  });
});