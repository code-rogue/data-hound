import * as cd from '@config/configData';
import * as team from '@utils/teamUtils';
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
import { LeagueData, PlayerData, SeasonData } from '@interfaces/nfl/stats';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLSeasonAdvStatService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatService';
import { NFLStatService } from '@data-services/nfl/statService';
import { ServiceName } from '@constants/nfl/service.constants';

import type { StringSplitResult } from '@data-services/utils/utils';

jest.mock('@log/logger');

let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let mockTeamLookup: jest.SpyInstance<number | null, [teamName?: string | undefined], any>;
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
    mockTeamLookup = jest.spyOn(team, 'teamLookup').mockImplementation(() => 5);
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
    const noPFR = {
      full_name: 'Travis Kelce',
      season: '2023',
    } as PlayerData;

    const blankPFR = {
      full_name: 'Travis Kelce',
      season: '2023',
      pfr_id: '',
    } as PlayerData;

    it.each([
      [0, 1, playerData],
      [1000, 0, noPFR],
      [1001, 0, blankPFR],
      [1002, 1, playerData],
    ])('should run successfully - player_id: %s, season_id: %s', async (player_id, season_id, data) => {
      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => data);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockProcessPlayerRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessSeasonRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processSeasonRecord')
        .mockImplementation(() => Promise.resolve(season_id));
      const mockProcessStatRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(record);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      
      if (!data.pfr_id || data.pfr_id === '') {
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing PFR Id: ${JSON.stringify(data)}.`, service.logContext);
      } else {
        expect(mockFindPlayer).toHaveBeenCalledWith(playerData);

        if (player_id === 0) {
          expect(logger.notice).toHaveBeenCalledWith(`No Player Found: ${data.full_name} [${data.pfr_id}].`, service.logContext);
          expect(mockProcessPlayerRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessLeagueRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessSeasonRecord).toHaveBeenCalledTimes(0);
          expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          expect(logger.debug).toHaveBeenCalledTimes(1);
        } else {
          expect(mockProcessPlayerRecord).toHaveBeenCalledWith(player_id, record);
          expect(mockProcessLeagueRecord).toHaveBeenCalledWith(player_id, record);
          if (season_id === 0) {
            expect(mockProcessStatRecord).toHaveBeenCalledTimes(0);
          } else {
            expect(mockProcessStatRecord).toHaveBeenCalledWith(season_id, record);
          }
          
          expect(logger.debug).toHaveBeenNthCalledWith(3, `Completed processing player record: ${JSON.stringify(record)}.`, service.logContext);
        }
      }

      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
      mockProcessPlayerRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
      mockProcessSeasonRecord.mockRestore();
      mockProcessStatRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
    });

    it('Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerByPFR').mockImplementation(() => Promise.resolve(1));

      const mockProcessSeasonRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processSeasonRecord')
        .mockImplementation(() => Promise.resolve(record.player_season_id));
      const mockProcessStatRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processStatRecord').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
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