import * as cd from '@config/configData';
import * as team from '@utils/teamUtils';
import * as util from '@utils/utils';

import {
  advStatRecord as record,
  advStatGameData as gameData,
  advStatLeagueData as leagueData,
  advStatPlayerData as playerData,
  configData,
} from '@test-nfl-constants/config.constants';
import { Config } from '@interfaces/config/config';
import { GameData, LeagueData, PlayerData } from '@interfaces/nfl/stats';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLStatService } from '@data-services/nfl/statService';
import { NFLWeeklyAdvStatService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatService';
import { NFLWeeklyStatService } from '@data-services/nfl/weeklyStats/weeklyStatService';
import { ServiceName } from '@constants/nfl/service.constants';

import type { StringSplitResult } from '@data-services/utils/utils';

jest.mock('@log/logger');

let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let mockTeamLookup: jest.SpyInstance<number | null, [teamName?: string | undefined], any>;
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
    mockTeamLookup = jest.spyOn(team, 'teamLookup').mockImplementation(() => 5);
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
      const {pfr_id, ...result}: PlayerData = playerData;
      (result as PlayerData).pfr_id = record.pfr_id;
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(record)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(record.full_name, ' ');
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
      // remove the team column
      const {team, opponent, ...result}: GameData = gameData;
      result.player_id = 0;
      expect(service.parseGameData(record)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenNthCalledWith(1, record.opponent);
      expect(mockTeamLookup).toHaveBeenNthCalledWith(2, record.team);
    });
  });
  
  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
      // remove the team column
      const {team, ...result}: LeagueData = leagueData;  
      result.player_id = 0;
      expect(service.parseLeagueData(record)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenCalledWith(record.team);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    const { pfr_id, ...noPFRData }: PlayerData = playerData;
    const blankPFR = noPFRData as PlayerData;
    blankPFR.pfr_id = '';
    
    it.each([
      [1, 0, 0, record, noPFRData as PlayerData],
      [2, 0, 0, record, blankPFR],
      [3, 0, 0, record, playerData],
      [4, 1001, 0, record, playerData],
      [5, 1001, 1, record, playerData],
    ])('should run successfully - idx: %s, id: %s, weekly_id: %s', async (idx, player_id, weekly_id, row, data) => {
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => data);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);

      if(idx === 1 || idx === 2) {
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing PFR Id: ${JSON.stringify(data)}.`, service.logContext);
      } else {
        expect(mockFindPlayer).toHaveBeenCalledWith(data);
        if (player_id === 0) {
          expect(logger.notice).toHaveBeenCalledWith(`No Player Found: ${data.full_name} [${data.pfr_id}].`, service.logContext);
          expect(mockProcessLeagueRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessGameRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          expect(logger.debug).toHaveBeenCalledTimes(1);
        } else {
          expect(mockProcessLeagueRecord).toHaveBeenCalledWith(player_id, row);
          expect(mockProcessGameRecord).toHaveBeenCalledWith(player_id, row);
          if (weekly_id === 0) {
            expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          } else {
            expect(mockProcessStatRecord).toHaveBeenCalledWith(weekly_id, row);
          }
          expect(logger.debug).toHaveBeenNthCalledWith(3,`Completed processing player record: ${JSON.stringify(row)}.`, service.logContext);
        }
      }

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessGameRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it.skip('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockImplementation(() => Promise.resolve(1));

      const mockProcessGameRecord = jest.spyOn(NFLWeeklyStatService.prototype, 'processGameRecord')
        .mockImplementation(() => Promise.resolve(record.player_weekly_id));
      const mockProcessStatRecord = jest.spyOn(NFLWeeklyAdvStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
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