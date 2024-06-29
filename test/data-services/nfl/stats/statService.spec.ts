import * as cd from '@config/configData';
import * as csv from '@csv/csvService';
import * as team from '@utils/teamUtils';
import * as util from '@data-services/utils/utils';

import { Config } from '@interfaces/config/config';
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
  SeasonStatTable,
  ServiceName,
  UnmatchedPlayerStatsTable
} from '@constants/nfl/service.constants';
import { NFLStatService } from '@data-services/nfl/statService';
import { PlayerIdentifiers } from '@interfaces/enums/nfl/player.enums';

import type { LeagueData, PlayerData } from '@interfaces/nfl/stats';
import type { SeasonData } from '@interfaces/nfl/stats';
import type { StringSplitResult } from '@utils/utils';

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

  describe('parseUnmatchedPlayerData', () => {
    const unmatchedData = {
      gsis_id: 'string',
      pfr_id: 'string',
      full_name: 'Travis Kelce',
      stat_service: ServiceName.NFLWeeklyAdvStatService,
      team: 'KC',
      team_id: 5
    };

    it('should parse successfully', () => {
      // remove the team column
      const {team, ...result} = unmatchedData;
      expect(service.parseUnmatchedPlayerData(unmatchedData)).toEqual(result);
      expect(mockTeamLookup).toHaveBeenCalledWith(unmatchedData.team);
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

  describe('findPlayerById', () => {
    const unmatchedData = { stat_service: 'me'};
    const fullDataRecord = {
      gsis_id: 'string',
      full_name: 'string',
    } as PlayerData;

    it.each([
      [1, 1001, PlayerIdentifiers.GSIS, fullDataRecord],
      [2, 1002, PlayerIdentifiers.PFR, fullDataRecord],
      [3, 0, 0, fullDataRecord],
      [4, 1001, 0, fullDataRecord],
    ])('should run successfully - idx: %s', async (idx, player_id, lookup, data ) => {
      const mockFindPlayerIdByGSIS = jest.spyOn(NFLStatService.prototype, 'findPlayerIdByGSIS').mockReturnValue(Promise.resolve(player_id)); 
      const mockFindPlayerIdByPFR = jest.spyOn(NFLStatService.prototype, 'findPlayerIdByPFR').mockReturnValue(Promise.resolve(player_id));
      const mockFindPlayerIdByName = jest.spyOn(NFLStatService.prototype, 'findPlayerIdByName').mockReturnValue(Promise.resolve(player_id));
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(0));
      const mockParseUnmatchedPlayerData = jest.spyOn(NFLStatService.prototype, 'parseUnmatchedPlayerData').mockReturnValue(unmatchedData);

      const result = await service.findPlayerById(data, lookup);
      expect(result).toEqual(player_id);
      switch (lookup) {
        case PlayerIdentifiers.GSIS: {
          expect(mockFindPlayerIdByGSIS).toHaveBeenCalledWith(data);
          expect(mockFindPlayerIdByPFR).toHaveBeenCalledTimes(0);
          expect(mockFindPlayerIdByName).toHaveBeenCalledTimes(0);
          expect(mockInsertRecord).toHaveBeenCalledTimes(0);
          break;
        }
        case PlayerIdentifiers.PFR: {
          expect(mockFindPlayerIdByGSIS).toHaveBeenCalledTimes(0);
          expect(mockFindPlayerIdByPFR).toHaveBeenCalledWith(data);
          expect(mockFindPlayerIdByName).toHaveBeenCalledTimes(0);
          expect(mockInsertRecord).toHaveBeenCalledTimes(0);
          break;
        }
        default: {  // lookup === 0
          expect(mockFindPlayerIdByGSIS).toHaveBeenCalledTimes(0);
          expect(mockFindPlayerIdByPFR).toHaveBeenCalledTimes(0);
          expect(mockFindPlayerIdByName).toHaveBeenCalledWith(data);

          if (player_id === 0) {
            expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, UnmatchedPlayerStatsTable, unmatchedData);
            expect(mockParseUnmatchedPlayerData).toHaveBeenCalledWith(data);            
          }
          else {
            expect(mockInsertRecord).toHaveBeenCalledTimes(0);
            expect(mockParseUnmatchedPlayerData).toHaveBeenCalledTimes(0);
          }
        }
      }

      mockFindPlayerIdByGSIS.mockRestore();
      mockFindPlayerIdByPFR.mockRestore();
      mockFindPlayerIdByName.mockRestore();
      mockInsertRecord.mockRestore();
      mockParseUnmatchedPlayerData.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFindPlayerIdByName = jest.spyOn(NFLStatService.prototype, 'findPlayerIdByName').mockRejectedValue(error);

      await expect(service.findPlayerById(fullDataRecord, 0)).rejects.toThrow(error);
      expect(mockFindPlayerIdByName).toHaveBeenCalledWith(fullDataRecord);
      
      mockFindPlayerIdByName.mockRestore();
    });    
  });

  describe('findPlayerIdByName', () => {
    const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerFullName} = $1`;
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
      [1, 0, false, noFullName],
      [2, 0, false, blankFullName],
      [3, 0, false, fullDataRecord],
      [4, 1001, false, fullDataRecord],
      [5, 1001, true, fullDataRecord],
      [6, 0, false, fullDataRecord],
    ])('should run successfully - idx: %s, player_id: %s', async (idx, player_id, multi, data) => {
      let records;
      if(player_id !== 0) {
        if (multi) 
          records = [ {id: player_id}, {id: player_id}] as unknown as [unknown];
        else
          records = [ {id: player_id}] as unknown as [unknown];
      } 
      else
        records = [] as unknown as [unknown];

      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        return Promise.resolve(records);
      });

      const result = await service.findPlayerIdByName(data);
      if (!data.full_name || data.full_name === '') {
        expect(result).toEqual(0);
        expect(mockFetchRecords).toHaveBeenCalledTimes(0);
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing Full Name: ${JSON.stringify(data)}.`, LogContext.NFLStatService);
      } else {
        expect(mockFetchRecords).toHaveBeenCalledWith(query, [data.full_name]);

        if(records.length === 1) { //if (records.length !== 1) {
          expect(result).toEqual(player_id);                    
        } else {
          expect(result).toEqual(0);
          expect(logger.notice).toHaveBeenCalledWith(`Unable to identify Player: '${data.full_name}' returned ${records.length} records`, LogContext.NFLStatService);
        }
      }

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.findPlayerIdByName(fullDataRecord)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, [fullDataRecord.full_name]);
      
      mockFetchRecords.mockRestore();
    });    
  });

  describe('findPlayerByGSIS', () => {
    const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerGSIS} = $1`;
    const noGSIS = {
      full_name: 'string',
    } as PlayerData;

    const blankGSIS = {
      full_name: 'string',
      gsis_id: '',
    } as PlayerData;

    const fullDataRecord = {
      gsis_id: 'string',
      full_name: 'string',
    } as PlayerData;

    it.each([
      [1, noGSIS, 0],
      [2, blankGSIS, 0],
      [3, fullDataRecord, 0],
      [4, fullDataRecord, 1001],
    ])('should run successfully - idx: %s', async (idx, data, player_id) => {
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        if(player_id !== 0)
          return Promise.resolve([ {id: player_id}]); 

        return Promise.resolve([] as unknown as [unknown]);
      });

      const result = await service.findPlayerIdByGSIS(data);
      if (!data.gsis_id || data.gsis_id === '') {
        expect(player_id).toEqual(0);
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing GSIS Id: ${JSON.stringify(data)}.`, LogContext.NFLStatService);
        expect(mockFetchRecords).toHaveBeenCalledTimes(0);
      } else {
        expect(result).toEqual(player_id);
        expect(mockFetchRecords).toHaveBeenCalledWith(query, [data.gsis_id]);
      }

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.findPlayerIdByGSIS(fullDataRecord)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, [fullDataRecord.gsis_id]);
      
      mockFetchRecords.mockRestore();
    });    
  });

  describe('findPlayerIdByPFR', () => {
    const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerPFR} = $1`;
    const noPFR = {
      full_name: 'string',
    } as PlayerData;

    const blankPFR = {
      full_name: 'string',
      pfr_id: '',
    } as PlayerData;

    const fullDataRecord = {
      pfr_id: 'string',
      full_name: 'string',
    } as PlayerData;

    it.each([
      [1, noPFR, 0],
      [2, blankPFR, 0],
      [3, fullDataRecord, 0],
      [4, fullDataRecord, 1001],
    ])('should run successfully - idx: %s', async (idx, data, player_id) => {
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        if(player_id !== 0)
          return Promise.resolve([{id: player_id}]); 

        return Promise.resolve([] as unknown as [unknown]);
      });

      const result = await service.findPlayerIdByPFR(data);
      if (!data.pfr_id || data.pfr_id === '') {
        expect(player_id).toEqual(0);
        expect(logger.notice).toHaveBeenCalledWith(`Player Record missing PFR Id: ${JSON.stringify(data)}.`, LogContext.NFLStatService);
        expect(mockFetchRecords).toHaveBeenCalledTimes(0);        
      }
      else {
        expect(result).toEqual(player_id);
        expect(mockFetchRecords).toHaveBeenCalledWith(query, [data.pfr_id]);
      }

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      await expect(service.findPlayerIdByPFR(fullDataRecord)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, [fullDataRecord.pfr_id]);
      
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