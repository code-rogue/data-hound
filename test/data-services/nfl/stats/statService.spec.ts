import * as cd from '@config/configData';
import * as csv from '@csv/csvService';
import * as team from '@utils/teamUtils';
import * as util from '@data-services/utils/utils';

import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService'
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';
import {
  NFLSchema,
  LeagueTable,
  PlayerFullName,
  PlayerGSIS,
  PlayerId,
  PlayerPFR,
  PlayerTable,
  SeasonStatTable
} from '@constants/nfl/service.constants';
import { 
    NFLStatService,
 } from '@data-services/nfl/statService';

import {
    configData,
    dataFile,
    noRawStatData as noData,
    statRecord,
    rawStatData as data,
    statLeagueData as leagueData,
    statPlayerData as playerData,
    seasonAdvStatData as seasonData,
    seasonAdvStatBaseRecord as seasonBaseRecord,
    seasonAdvStatRecord as seasonRecord,     
} from '@test-nfl-constants/config.constants';

import type { 
  LeagueData,
  PlayerData,
} from '@interfaces/nfl/stats';
import type { SeasonData } from '@interfaces/nfl/stats';
import type {
  StringSplitResult,
} from '@utils/utils';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let mockTeamLookup: jest.SpyInstance<number | null, [teamName?: string | undefined], any>;
let service: NFLStatService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    mockTeamLookup = jest.spyOn(team, 'teamLookup').mockImplementation(() => 5);
    service = new NFLStatService();
  });

  describe('parsePlayerData', () => {
    it('should parse successfully', () => {
      const { pfr_id, ...result }: PlayerData = playerData
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(statRecord)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(statRecord.full_name, ' ');
    });
  });

  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        // remove the team column
        const {team, ...result}: LeagueData = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(statRecord)).toEqual(result);
        expect(mockTeamLookup).toHaveBeenCalledWith(statRecord.team);
    });
  });

  describe('processLeagueRecord', () => {
    it('should run successfully', async () => {
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation();
      const mockParseLeagueData = jest.spyOn(NFLStatService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);
      
      const player_id = statRecord.player_id;
      await service.processLeagueRecord(player_id, statRecord);
      
      expect(mockParseLeagueData).toHaveBeenCalledWith(statRecord);
      expect(mockProcessRecord).toHaveBeenCalledWith(NFLSchema, LeagueTable, PlayerId, player_id, leagueData);

      mockProcessRecord.mockRestore();
      mockParseLeagueData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockProcessRecord = jest.spyOn(DBService.prototype, 'processRecord').mockImplementation().mockRejectedValue(error);
      const mockParseLeagueData = jest.spyOn(NFLStatService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);

      await expect(service.processLeagueRecord(1, statRecord)).rejects.toThrow(error);
      expect(mockParseLeagueData).toHaveBeenCalledWith(statRecord);
      
      mockParseLeagueData.mockRestore();
      mockProcessRecord.mockRestore();
    });    
  });

  describe('processProcedures', () => {
    it('should call the procedures', async () => {
      await service.processProcedures();
    });
  });

  describe('processPlayerRecord', () => {
    it('should run successfully', async () => {
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      
      const player_id = statRecord.player_id;
      await service.processPlayerRecord(player_id, statRecord);
      
      expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, 'id', player_id, statRecord);
      mockUpdateRecord.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation().mockRejectedValue(error);

      await expect(service.processPlayerRecord(1, statRecord)).rejects.toThrow(error);
      
      mockUpdateRecord.mockRestore();
    });    
  });

  describe('parseSeasonData', () => {
    const {age, games_played, games_started, ...seasonBaseData} = seasonData;

    it.each([
      [seasonBaseRecord],
      [seasonRecord],
    ])
    ('should parse successfully', (data: SeasonData) => {
      // remove the team column
      const {team, ...result}: SeasonData = seasonData;

        result.player_id = 0;
        result.age = data.age ?? 0;
        result.games_played = data.games_played ?? 0;
        result.games_started = data.games_started ?? 0;
        expect(service.parseSeasonData(data)).toEqual(result);
        expect(mockTeamLookup).toHaveBeenCalledWith(data.team);
    });
  });

  describe('processPlayerDataRow', () => {
    it('should run successfully (abstract function))', async () => {
      await service.processPlayerDataRow(statRecord);
    });
  });

  describe('processPlayerData', () => {
    it.each([
      [noData],
      [data],
      [[statRecord, statRecord]],
    ])('should run processPlayerData successfully', async (data) => {
      const mockProcessPlayerDataRow = jest.spyOn(NFLStatService.prototype, 'processPlayerDataRow').mockImplementation();
      await service.processPlayerData(data);
      
      expect(logger.log).toHaveBeenCalledWith(`Processing player records [${data.length}]`, LogContext.NFLStatService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledTimes(data.length);
      data.forEach(row => {
        expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(row);
      })
      
      expect(logger.log).toHaveBeenCalledWith('Processed player stat records.', LogContext.NFLStatService);
      mockProcessPlayerDataRow.mockRestore();
    });

    it('processPlayerData should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerDataRow = jest.spyOn(NFLStatService.prototype, 'processPlayerDataRow').mockRejectedValue(error);

      await expect(service.processPlayerData(data)).rejects.toThrow(error);

      expect(logger.log).toHaveBeenNthCalledWith(1, `Processing player records [1]`, LogContext.NFLStatService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(statRecord);

      mockProcessPlayerDataRow.mockRestore();
    });
  });

  describe('processSeasonRecord', () => {
    it.each([
      [true, seasonRecord, { id: seasonRecord.player_season_id }],
      [false, seasonRecord, { id: 0 }],
      [false, seasonRecord, undefined],
    ])('should run successfully - exists: "%s"', async (exists, row, statRecord) => {
      const player_id = row.player_id;
      const season_id = seasonRecord.player_season_id;
      const query = `SELECT id FROM ${NFLSchema}.${SeasonStatTable} WHERE ${PlayerId} = $1 AND season = $2 AND team_id = $3`;
      const keys = [player_id, seasonRecord.season, seasonRecord.team_id];

      const mockParseSeasonData = jest.spyOn(NFLStatService.prototype, 'parseSeasonData').mockImplementation(() => seasonData);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords')
        .mockImplementation(() => Promise.resolve( (statRecord?.id) ? [statRecord] : undefined));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(row.player_season_id));

      const result = await service.processSeasonRecord(player_id, row);
      expect(result).toEqual(season_id);
      expect(mockParseSeasonData).toHaveBeenCalledWith(row);
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

    it('Missing team_id should log and return 0', async () => {
      const player_id = 1;
      const {team_id, ...updatedSeasonRecord }: SeasonData = seasonData;
      const mockParseSeasonData = jest.spyOn(NFLStatService.prototype, 'parseSeasonData').mockImplementation(() => updatedSeasonRecord);

      expect(await service.processSeasonRecord(player_id, seasonRecord)).toEqual(0);
      expect(mockParseSeasonData).toHaveBeenCalledWith(seasonRecord);
      expect(logger.warn).toHaveBeenCalledWith(`Unable to process Season Record for Player Id: ${player_id} - Team: ${(updatedSeasonRecord as SeasonData)?.team_id}`, LogContext.NFLStatService);
      
      mockParseSeasonData.mockRestore();
    });

    it.each([
      [null],
      [0],
    ])('Invalid team_id: %s', async (team_id) => {
      const player_id = 1;
      const updatedSeasonRecord = seasonData;
      updatedSeasonRecord.team_id = team_id

      const mockParseSeasonData = jest.spyOn(NFLStatService.prototype, 'parseSeasonData').mockImplementation(() => updatedSeasonRecord);
      
      expect(await service.processSeasonRecord(player_id, seasonRecord)).toEqual(0);
      expect(mockParseSeasonData).toHaveBeenCalledWith(seasonRecord);
      expect(logger.warn).toHaveBeenCalledWith(`Unable to process Season Record for Player Id: ${player_id} - Team: ${team_id}`, LogContext.NFLStatService);

      mockParseSeasonData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const {team_id, ...seasonDataRecord}: SeasonData = seasonData;
      (seasonDataRecord as SeasonData).team_id = 5;

      const error = new Error("error");
      const mockParseSeasonData = jest.spyOn(NFLStatService.prototype, 'parseSeasonData').mockImplementation(() => seasonDataRecord);
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.processSeasonRecord(1, seasonRecord)).rejects.toThrow(error);
      expect(mockParseSeasonData).toHaveBeenCalledWith(seasonRecord);
      mockParseSeasonData.mockRestore();
      mockFetchRecords.mockRestore();
    });    
  });

  describe('findPlayerByGSIS', () => {
    const baseQuery = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerGSIS} = $1`;
    const fullQuery = `${baseQuery} OR ${PlayerFullName} = $2`;
    const noGSIS = {
      full_name: 'string',
    } as PlayerData;

    const blankGSIS = {
      full_name: 'string',
      gsis_id: '',
    } as PlayerData;

    const noFullName = {
      gsis_id: 'string',
    } as PlayerData;

    const blankFullName = {
      gsis_id: 'string',
      full_name: '',
    } as PlayerData;
   
    const fullDataRecord = {
      gsis_id: 'string',
      full_name: 'string',
    } as PlayerData;

    it.each([
      [1, noGSIS, 0],
      [2, blankGSIS, 0],
      [3, noFullName, 0],
      [4, blankFullName, 0],      
      [5, fullDataRecord, 0],
      [6, fullDataRecord, 1001],
    ])('should run successfully - idx: %s', async (idx, data, player_id) => {
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        if(player_id !== 0)
          return Promise.resolve([ {id: player_id}]); 

        return Promise.resolve([] as unknown as [unknown]);
      });

      let query = baseQuery;
      const keys = [data.gsis_id];
      
      if (data.full_name && data.full_name !== '') {
        query = fullQuery;
        keys.push(data.full_name);
      }
      
      const result = await service.findPlayerByGSIS(data);
      if (!data.gsis_id || data.gsis_id === '') {
        expect(player_id).toEqual(0);
        expect(mockFetchRecords).toHaveBeenCalledTimes(0);        
      } else {
        expect(result).toEqual(player_id);
        expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);
      }

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      const keys = [fullDataRecord.gsis_id, fullDataRecord.full_name];
      await expect(service.findPlayerByGSIS(fullDataRecord)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(fullQuery, keys);
      
      mockFetchRecords.mockRestore();
    });    
  });

  describe('findPlayerByPFR', () => {
    const baseQuery = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerPFR} = $1`;
    const fullQuery = `${baseQuery} OR ${PlayerFullName} = $2`;
    const noPFR = {
      full_name: 'string',
    } as PlayerData;

    const blankPFR = {
      full_name: 'string',
      pfr_id: '',
    } as PlayerData;

    const noFullName = {
      pfr_id: 'string',
    } as PlayerData;

    const blankFullName = {
      pfr_id: 'string',
      full_name: '',
    } as PlayerData;
   
    const fullDataRecord = {
      pfr_id: 'string',
      full_name: 'string',
    } as PlayerData;

    it.each([
      [1, noPFR, 0],
      [2, blankPFR, 0],
      [3, noFullName, 0],
      [4, blankFullName, 0],
      [5, fullDataRecord, 0],
      [6, fullDataRecord, 1001],
    ])('should run successfully - idx: %s', async (idx, data, player_id) => {
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        if(player_id !== 0)
          return Promise.resolve([{id: player_id}]); 

        return Promise.resolve([] as unknown as [unknown]);
      });

      let query = baseQuery;
      const keys = [data.pfr_id];
      
      if (data.full_name && data.full_name !== '') {
        query = fullQuery;
        keys.push(data.full_name);
      }

      const result = await service.findPlayerByPFR(data);
      if (!data.pfr_id || data.pfr_id === '') {
        expect(player_id).toEqual(0);
        expect(mockFetchRecords).toHaveBeenCalledTimes(0);        
      }
      else {
        expect(result).toEqual(player_id);
        expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);
      }

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      const keys = [fullDataRecord.pfr_id, fullDataRecord.full_name];
      await expect(service.findPlayerByPFR(fullDataRecord)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(fullQuery, keys);
      
      mockFetchRecords.mockRestore();
    });    
  });

  describe('parseAndLoadStats', () => {
    const url = 'testUrl';
    
    it('should run successfully', async () => {
      const mockProcessPlayerData = jest.spyOn(NFLStatService.prototype, 'processPlayerData').mockImplementation();
      service.columns = configData.nfl.player_weekly_stats.columns;
      await service.parseAndLoadStats(url);
      
      expect(logger.log).toHaveBeenNthCalledWith(1, `Downloading and parsing: ${url}`, LogContext.NFLStatService);
      expect(mockDownloadCSV).toHaveBeenCalledWith(url);
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.player_weekly_stats.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);

      expect(logger.log).toHaveBeenNthCalledWith(2, `Completed processing: ${url}`, LogContext.NFLStatService);
      mockProcessPlayerData.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerData = jest.spyOn(NFLStatService.prototype, 'processPlayerData').mockRejectedValue(error);

      await expect(service.parseAndLoadStats(url)).rejects.toThrow(error);
      mockProcessPlayerData.mockRestore();
    });
  });

  describe('runService', () => {
    const url = 'testURL';
    it('should run successfully', async () => {
      const mockParseAndLoadStats = jest.spyOn(NFLStatService.prototype, 'parseAndLoadStats').mockImplementation();
      
      const urls = configData.nfl.player_weekly_stats.urls;
      service.urls = urls;
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadStats).toHaveBeenCalledTimes(urls.length);
      urls.forEach(url => {
        expect(mockParseAndLoadStats).toHaveBeenCalledWith(url);

      })
      
      mockParseAndLoadStats.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockParseAndLoadStats = jest.spyOn(NFLStatService.prototype, 'parseAndLoadStats').mockRejectedValue(error);

      service.urls = configData.nfl.player_weekly_stats.urls;
      await expect(service.runService()).rejects.toThrow(error);

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadStats).toHaveBeenCalledWith(service.urls[0]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);

      mockParseAndLoadStats.mockRestore();
    });
  });
});