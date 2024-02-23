import * as cd from '../../../../src/config/configData';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { NFLWeeklyAdvStatService } from '../../../../src/data-services/nfl/advStatService'
import { NFLWeeklyAdvStatPassService } from '../../../../src/data-services/nfl/weeklyAdvStatPassService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
    AdvPassTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../../../src/constants/nfl/service.constants';

import {
    advPassData,
    configData,
    statPlayerData as playerData,
    weeklyAdvStatPassRecord,
} from '../constants/config.constants';

import type { 
    RawWeeklyAdvStatPassData, 
} from '../../../../src/interfaces/nfl/weeklyAdvStatsPass';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatPassService;

describe('NFLWeeklyAdvStatPassService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatPassService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_pass_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_pass_stats.urls);
    });
  });

  describe('parseAdvPassData', () => {
    it.each([
        [null, null, null, null, null, null, null, null, null, null, null],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ])('should parse successfully - drops %s', (pass_drops, pass_drop_pct, rec_drop, rec_drop_pct, bad_throws, bad_throw_pct, blitzed, hurried, hit, pressured, pressured_pct) => {
        const result = advPassData;
        result.player_weekly_id = 0;

        const data: RawWeeklyAdvStatPassData = weeklyAdvStatPassRecord;
        data.pass_drops = pass_drops;
        data.pass_drop_pct = pass_drop_pct;
        data.rec_drop = rec_drop;
        data.rec_drop_pct = rec_drop_pct;
        data.bad_throws = bad_throws;
        data.bad_throw_pct = bad_throw_pct;
        data.blitzed = blitzed;
        data.hurried = hurried;
        data.hit = hit;
        data.pressured = pressured;
        data.pressured_pct = pressured_pct;

        result.pass_drops = (pass_drops) ? data.pass_drops : 0;
        result.pass_drop_pct = (pass_drop_pct) ? data.pass_drop_pct : 0;
        result.rec_drop = (rec_drop) ? data.rec_drop : 0;
        result.rec_drop_pct = (rec_drop_pct) ? data.rec_drop_pct : 0;
        result.bad_throws = (bad_throws) ? data.bad_throws : 0;
        result.bad_throw_pct = (bad_throw_pct) ? data.bad_throw_pct : 0;
        result.blitzed = (blitzed) ? data.blitzed : 0;
        result.hurried = (hurried) ? data.hurried : 0;
        result.hit = (hit) ? data.hit : 0;
        result.pressured = (pressured) ? data.pressured : 0;
        result.pressured_pct = (pressured_pct) ? data.pressured_pct : 0;
        expect(service.parseAdvPassData(data)).toEqual(result);
    });
  });

  describe('processAdvPassRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseAdvPassData = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'parseAdvPassData').mockImplementation(() => advPassData);
      
      const weekly_id = weeklyAdvStatPassRecord.player_weekly_id;
      await service.processAdvPassRecord(weekly_id, weeklyAdvStatPassRecord);
      
      expect(mockParseAdvPassData).toHaveBeenCalledWith(weeklyAdvStatPassRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, AdvPassTable, WeeklyStatId, weekly_id, advPassData);

      mockProcessRecord.mockRestore();
      mockParseAdvPassData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseAdvPassData = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'parseAdvPassData').mockImplementation(() => advPassData);

      await expect(service.processAdvPassRecord(1, weeklyAdvStatPassRecord)).rejects.toThrow(error);
      expect(mockParseAdvPassData).toHaveBeenCalledWith(weeklyAdvStatPassRecord);
      
      mockProcessRecord.mockRestore();
      mockParseAdvPassData.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyAdvStatPassRecord],
      [1001, false, weeklyAdvStatPassRecord],
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
      const mockProcessAdvPassRecord = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'processAdvPassRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData);

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.pfr_id}].`,
          LogContext.NFLWeeklyAdvStatPassService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessAdvPassRecord).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatPassService);

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvPassRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatPassRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyAdvStatPassRecord);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyAdvStatPassRecord.player_weekly_id));
      const mockProcessAdvPassRecord = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'processAdvPassRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatPassRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvPassRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Pass Stat Service started...', LogContext.NFLWeeklyAdvStatPassService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Pass Stat Service started...', LogContext.NFLWeeklyAdvStatPassService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Adv Pass Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatPassService);

      mockRunService.mockRestore();
    });
  });
});