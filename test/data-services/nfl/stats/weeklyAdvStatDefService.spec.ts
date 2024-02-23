import * as cd from '../../../../src/config/configData';
import { Config } from '../../../../src/config/config';
import { DBService } from '../../../../src/database/dbService'
import { NFLStatService } from '../../../../src/data-services/nfl/statService'
import { NFLWeeklyAdvStatService } from '../../../../src/data-services/nfl/advStatService'
import { NFLWeeklyAdvStatDefService } from '../../../../src/data-services/nfl/weeklyAdvStatDefService'
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
    AdvDefTable,
    NFLSchema,
    PlayerTable,
    WeeklyStatId,
} from '../../../../src/constants/nfl/service.constants';

import {
    advDefData,
    configData,
    statPlayerData as playerData,
    weeklyAdvStatDefRecord,
} from '../constants/config.constants';

import type { 
    RawWeeklyAdvStatDefData, 
} from '../../../../src/interfaces/nfl/weeklyAdvStatsDef';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let service: NFLWeeklyAdvStatDefService;

describe('NFLWeeklyAdvStatDefService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    service = new NFLWeeklyAdvStatDefService();
  });
  
  describe('Constructor', () => {
    it('should set columns', () => {
        expect(service.columns).toEqual(configData.nfl.player_weekly_adv_def_stats.columns);
        expect(service.urls).toEqual(configData.nfl.player_weekly_adv_def_stats.urls);
    });
  });

  describe('parseAdvDefData', () => {
    it.each([
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ])('should parse successfully - tgt %s', (tgt, comp, comp_pct, yards, yards_cmp, yards_tgt, rec_td, qb_rating, adot, air_yards, yards_after, blitz, hurry, pressure, tack_comb, tack_miss, tack_miss_pct) => {
        const result = advDefData;
        result.player_weekly_id = 0;

        const data: RawWeeklyAdvStatDefData = weeklyAdvStatDefRecord;
        data.targets = tgt;
        data.completions_allowed = comp;
        data.completion_pct = comp_pct;
        data.yards_allowed = yards;
        data.yards_allowed_per_cmp = yards_cmp;
        data.yards_allowed_per_tgt = yards_tgt;
        data.rec_td_allowed = rec_td;
        data.passer_rating_allowed = qb_rating;
        data.adot = adot;
        data.air_yards_completed = air_yards;
        data.yards_after_catch = yards_after;
        data.blitzed = blitz;
        data.hurried = hurry;
        data.pressures = pressure;
        data.tackles_combined = tack_comb;
        data.tackles_missed = tack_miss;
        data.tackle_missed_pct = tack_miss_pct;

        result.targets = (tgt) ? data.targets : 0;
        result.completions_allowed = (comp) ? data.completions_allowed : 0;
        result.completion_pct = (comp_pct) ? data.completion_pct : 0;
        result.yards_allowed = (yards) ? data.yards_allowed : 0;
        result.yards_allowed_per_cmp = (yards_cmp) ? data.yards_allowed_per_cmp : 0;
        result.yards_allowed_per_tgt = (yards_tgt) ? data.yards_allowed_per_tgt : 0;
        result.rec_td_allowed = (rec_td) ? data.rec_td_allowed : 0;
        result.passer_rating_allowed = (qb_rating) ? data.passer_rating_allowed : 0;
        result.adot = (adot) ? data.adot : 0;
        result.air_yards_completed = (air_yards) ? data.air_yards_completed : 0;
        result.yards_after_catch = (yards_after) ? data.yards_after_catch : 0;
        result.blitzed = (blitz) ? data.blitzed : 0;
        result.hurried = (hurry) ? data.hurried : 0;
        result.pressures = (pressure) ? data.pressures : 0;
        result.tackles_combined = (tack_comb) ? data.tackles_combined : 0;
        result.tackles_missed = (tack_miss) ? data.tackles_missed : 0;
        result.tackle_missed_pct = (tack_miss_pct) ? data.tackle_missed_pct : 0;
        expect(service.parseAdvDefData(data)).toEqual(result);
    });
  });

  describe('processAdvDefRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseAdvDefData = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'parseAdvDefData').mockImplementation(() => advDefData);
      
      const weekly_id = weeklyAdvStatDefRecord.player_weekly_id;
      await service.processAdvDefRecord(weekly_id, weeklyAdvStatDefRecord);
      
      expect(mockParseAdvDefData).toHaveBeenCalledWith(weeklyAdvStatDefRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, AdvDefTable, WeeklyStatId, weekly_id, advDefData);

      mockProcessRecord.mockRestore();
      mockParseAdvDefData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseAdvDefData = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'parseAdvDefData').mockImplementation(() => advDefData);

      await expect(service.processAdvDefRecord(1, weeklyAdvStatDefRecord)).rejects.toThrow(error);
      expect(mockParseAdvDefData).toHaveBeenCalledWith(weeklyAdvStatDefRecord);
      
      mockProcessRecord.mockRestore();
      mockParseAdvDefData.mockRestore();
    });    
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, weeklyAdvStatDefRecord],
      [1001, false, weeklyAdvStatDefRecord],
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
      const mockParseAdvDefData = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'processAdvDefRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData);

      let logIndex = 2;
      if (bInsert) {
        expect(logger.debug).toHaveBeenNthCalledWith(logIndex++,`No Player Found, creating player record: ${playerData.full_name} [${playerData.pfr_id}].`,
          LogContext.NFLWeeklyAdvStatDefService);

        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
        expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      } 

      expect(mockProcessGameRecord).toHaveBeenCalledWith(id, row);
      expect(mockParseAdvDefData).toHaveBeenCalledWith(weekly_id, row);

      // Await the logger.debug call
      expect(logger.debug).toHaveBeenNthCalledWith(logIndex,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLWeeklyAdvStatDefService);

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockParseAdvDefData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatDefRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(weeklyAdvStatDefRecord);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'findPlayer').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weeklyAdvStatDefRecord.player_weekly_id));
      const mockProcessAdvDefRecord = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'processAdvDefRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(weeklyAdvStatDefRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessAdvDefRecord.mockRestore();
    });
  });

  describe('runService', () => {
    it('should run successfully', async () => {
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Def Stat Service started...', LogContext.NFLWeeklyAdvStatDefService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      
      mockRunService.mockRestore()
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockRunService = jest.spyOn(NFLStatService.prototype, 'runService').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Adv Def Stat Service started...', LogContext.NFLWeeklyAdvStatDefService);
      expect(mockRunService).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Adv Def Stat Service did not complete', error.message, LogContext.NFLWeeklyAdvStatDefService);

      mockRunService.mockRestore();
    });
  });
});