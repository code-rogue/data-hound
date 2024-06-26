import * as cd from '@config/configData';
import * as team from '@utils/teamUtils';
import * as util from '@utils/utils';

import { Config } from '@interfaces/config/config';
import {
  configData,
  seasonAdvStatLeagueData as leagueData,
  seasonAdvStatPlayerData as playerData,
  seasonAdvStatRecord as record,   
} from '@test-nfl-constants/config.constants';
import { LeagueData } from '@interfaces/nfl/stats';
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import { NFLSeasonAdvStatService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatService';
import { NFLStatService } from '@data-services/nfl/statService';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';
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

  describe('parseUnmatchedPlayerData', () => {
    const unmatchedData = {
      pfr_id: 'string',
      full_name: 'Travis Kelce',
      stat_service: ServiceName.NFLSeasonAdvStatService,
      team: 'KC',
      team_id: 5,
      season: '2023'
    };

    it('should parse successfully', () => {
      // remove the team column
      const {team, ...result} = unmatchedData;
      expect(service.parseUnmatchedPlayerData(unmatchedData)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenCalledWith(unmatchedData.team);
    });
  });

  describe('processStatRecord', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processStatRecord(1, record);
    });
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, 1],
      [1001, 0],
      [1002, 1],
    ])('should run successfully - player_id: %s, season_id: %s', async (player_id, season_id) => {
      const mockParsePlayerData = jest.spyOn(NFLSeasonAdvStatService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerById')
        .mockImplementation(() => Promise.resolve(player_id));

      const mockProcessPlayerRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLStatService.prototype, 'processLeagueRecord').mockImplementation();
      
      const mockProcessSeasonRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processSeasonRecord')
        .mockImplementation(() => Promise.resolve(season_id));
      const mockProcessStatRecord = jest.spyOn(NFLSeasonAdvStatService.prototype, 'processStatRecord').mockImplementation();

      await service.processPlayerDataRow(record);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData, PlayerIdentifiers.PFR);

      if (player_id === 0) {
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
      const mockFindPlayer = jest.spyOn(NFLStatService.prototype, 'findPlayerById').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(record)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(record);
      expect(mockFindPlayer).toHaveBeenCalledWith(playerData, PlayerIdentifiers.PFR);
      
      mockParsePlayerData.mockRestore();
      mockFindPlayer.mockRestore();
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