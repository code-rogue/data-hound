import * as cd from '@config/configData';
import * as csv from '@csv/csvService';
import { Config } from '@interfaces/config/config';
import { DBService } from '@database/dbService'
import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';

import {
  BioTable,
  LeagueTable,
  NFLSchema,
  PlayerId,
  PlayerSmartId,
  PlayerTable
} from '@constants/nfl/service.constants';

import { 
  NFLPlayerService
 } from '@data-services/nfl/playerService';

 import {
  configData,
  dataFile,
  noRawPayerData as noData,
  playerRecord,
  rawPlayerData as data,
  playerData,
  leagueData,
  bioData,
 } from '@test-nfl-constants/config.constants';

import type { 
    BioData,
    LeagueData,
 } from '@interfaces/nfl/player';

jest.mock('@log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV: jest.SpyInstance<Promise<string>, [url: string], any>;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let service: NFLPlayerService;

describe('NFLPlayerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    service = new NFLPlayerService();
  });

  describe('runService', () => {
    it('should run the service successfully', async () => {
      const mockParseAndLoadPlayers = jest.spyOn(NFLPlayerService.prototype, 'parseAndLoadPlayers').mockImplementation();
      
      const urls = configData.nfl.players.urls;
      service.urls = urls;
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Service started...', LogContext.NFLPlayerService);
      
      expect(mockParseAndLoadPlayers).toHaveBeenCalledTimes(urls.length);
      urls.forEach(url => {
        expect(mockParseAndLoadPlayers).toHaveBeenCalledWith(url);

      })
      mockParseAndLoadPlayers.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockParseAndLoadPlayers = jest.spyOn(NFLPlayerService.prototype, 'parseAndLoadPlayers').mockRejectedValue(error);

      service.urls = configData.nfl.players.urls;
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(mockParseAndLoadPlayers).toHaveBeenCalledWith(service.urls[0]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Service did not complete', error.message, LogContext.NFLPlayerService);
      
      mockParseAndLoadPlayers.mockRestore();
    });
  });

  describe('parseAndLoadPlayers', () => {
    const url = 'testUrl';
    
    it('should run successfully', async () => {
      const mockProcessPlayerData = jest.spyOn(NFLPlayerService.prototype, 'processPlayerData').mockImplementation();
      service.columns = configData.nfl.player_weekly_stats.columns;
      await service.parseAndLoadPlayers(url);
      
      expect(logger.log).toHaveBeenNthCalledWith(1, `Downloading and parsing: ${url}`, LogContext.NFLPlayerService);
      expect(mockDownloadCSV).toHaveBeenCalledWith(url);
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.player_weekly_stats.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);

      expect(logger.log).toHaveBeenNthCalledWith(2, `Completed processing: ${url}`, LogContext.NFLPlayerService);
      mockProcessPlayerData.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerData = jest.spyOn(NFLPlayerService.prototype, 'processPlayerData').mockRejectedValue(error);

      await expect(service.parseAndLoadPlayers(url)).rejects.toThrow(error);
      mockProcessPlayerData.mockRestore();
    });
  });

  describe('processPlayerData', () => {
    it.each([
      [noData],
      [data],
      [[playerRecord, playerRecord]],
    ])('should run processPlayerData successfully', async (data) => {
      const mockProcessPlayerDataRow = jest.spyOn(NFLPlayerService.prototype, 'processPlayerDataRow').mockImplementation();

      await service.processPlayerData(data);
      
      expect(logger.log).toHaveBeenNthCalledWith(1,`Processing player records [${data.length}]`, LogContext.NFLPlayerService);

      expect(mockProcessPlayerDataRow).toHaveBeenCalledTimes(data.length);
      data.forEach(row => {
        expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(row);
      })
      
      expect(logger.log).toHaveBeenNthCalledWith(2,'Processed player records.', LogContext.NFLPlayerService);

      mockProcessPlayerDataRow.mockRestore();
    });

    it('processPlayerData should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerDataRow = jest.spyOn(NFLPlayerService.prototype, 'processPlayerDataRow').mockRejectedValue(error);

      await expect(service.processPlayerData(data)).rejects.toThrow(error);

      expect(logger.log).toHaveBeenCalledWith(`Processing player records [1]`, LogContext.NFLPlayerService);
      expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(playerRecord);

      mockProcessPlayerDataRow.mockRestore();
    });
  });

  describe('processPlayerDataRow', () => {
    it.each([
      [0, true, playerRecord],
      [1001, false, playerRecord],
    ])('should run processPlayerDataRow successfully - id: "%s", insert: "$s"', async (player_id, bInsert, row) => {
      let id = player_id;
      const mockParsePlayerData = jest.spyOn(NFLPlayerService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(player_id));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const mockProcessBioRecord = jest.spyOn(NFLPlayerService.prototype, 'processBioRecord').mockImplementation();
      const mockProcessLeagueRecord = jest.spyOn(NFLPlayerService.prototype, 'processLeagueRecord').mockImplementation();

      await service.processPlayerDataRow(row);
      expect(mockParsePlayerData).toHaveBeenCalledWith(row);
      expect(mockRecordLookup).toHaveBeenCalledWith(NFLSchema, PlayerTable, PlayerSmartId, playerData.smart_id, 'id');

      if (bInsert) {
        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, playerData);
        id++;
      } 
      else {
        expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, PlayerTable, 'id', player_id, playerData);
      }

      expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
      expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
      expect(logger.debug).toHaveBeenNthCalledWith(2,`Completed processing player record: ${JSON.stringify(row)}.`, LogContext.NFLPlayerService);

      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockUpdateRecord.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
    });

    it('processPlayerDataRow should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParsePlayerData = jest.spyOn(NFLPlayerService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup').mockRejectedValue(error);

      await expect(service.processPlayerDataRow(playerRecord)).rejects.toThrow(error);
      expect(mockParsePlayerData).toHaveBeenCalledWith(playerRecord);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
    });

    it('processPlayerDataRow Promise All should catch and throw the error', async () => {
      const error = new Error("error");

      const mockParsePlayerData = jest.spyOn(NFLPlayerService.prototype, 'parsePlayerData').mockImplementation(() => playerData);
      const mockRecordLookup = jest.spyOn(DBService.prototype, 'recordLookup')
        .mockImplementation(() => Promise.resolve(0));
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(1));
      const mockProcessBioRecord = jest.spyOn(NFLPlayerService.prototype, 'processBioRecord').mockRejectedValue(error);
      const mockProcessLeagueRecord = jest.spyOn(NFLPlayerService.prototype, 'processLeagueRecord').mockImplementation();

      await expect(service.processPlayerDataRow(playerRecord)).rejects.toThrow(error);
      mockParsePlayerData.mockRestore();
      mockRecordLookup.mockRestore();
      mockInsertRecord.mockRestore();
      mockProcessBioRecord.mockRestore();
      mockProcessLeagueRecord.mockRestore();
    });
  });

  describe('processLeagueRecord', () => {
    it.each([
      [true, playerRecord],
      [false, playerRecord],
    ])('should run processLeagueRecord successfully - exists: "%s"', async (exists, row) => {
      const mockParseLeagueData = jest.spyOn(NFLPlayerService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);
      const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists')
        .mockImplementation(() => Promise.resolve(exists));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const player_id = (exists) ? 1 : 0;

      await service.processLeagueRecord(player_id, row);
      expect(mockParseLeagueData).toHaveBeenCalledWith(row);
      expect(mockRecordExists).toHaveBeenCalledWith(NFLSchema, LeagueTable, PlayerId, player_id);

      if (exists) {
        const { player_id, ...updateLeagueData }: LeagueData = leagueData;
        expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, LeagueTable, PlayerId, player_id, updateLeagueData);
      } 
      else {
        const insertLeagueData = leagueData;
        insertLeagueData.player_id = player_id;
        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, LeagueTable, insertLeagueData);
      }

      mockParseLeagueData.mockRestore();
      mockRecordExists.mockRestore();
      mockUpdateRecord.mockRestore();
      mockInsertRecord.mockRestore();
    });

    it('processLeagueRecord should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseLeagueData = jest.spyOn(NFLPlayerService.prototype, 'parseLeagueData').mockImplementation(() => leagueData);
      const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation().mockRejectedValue(error);

      await expect(service.processLeagueRecord(1, playerRecord)).rejects.toThrow(error);
      expect(mockParseLeagueData).toHaveBeenCalledWith(playerRecord);
      mockParseLeagueData.mockRestore();
      mockRecordExists.mockRestore();
    });    
  });

  describe('processBioRecord', () => {
    it.each([
      [true, playerRecord],
      [false, playerRecord],
    ])('should run processBioRecord successfully - exists: "%s"', async (exists, row) => {
      const mockParseBioData = jest.spyOn(NFLPlayerService.prototype, 'parseBioData').mockImplementation(() => bioData);
      const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists')
        .mockImplementation(() => Promise.resolve(exists));
      const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const player_id = (exists) ? 1 : 0;

      await service.processBioRecord(player_id, row);
      expect(mockParseBioData).toHaveBeenCalledWith(row);
      expect(mockRecordExists).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id);

      if (exists) {
        const { player_id, ...updateBioData }: BioData = bioData;
        expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id, updateBioData);
      } 
      else {
        const insertBioData = bioData;
        insertBioData.player_id = player_id;
        expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, BioTable, insertBioData);
      }

      mockParseBioData.mockRestore();
      mockRecordExists.mockRestore();
      mockUpdateRecord.mockRestore();
      mockInsertRecord.mockRestore();
    });

    it('processBioRecord should parse out null birth_Date', async () => {
      const nullBirthDate = bioData;
      nullBirthDate.birth_date = null;

      let noBirthDate = bioData;

      const mockParseBioData = jest.spyOn(NFLPlayerService.prototype, 'parseBioData').mockImplementation(() => nullBirthDate);
      const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation(() => Promise.resolve(false));
      const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
      const player_id = 1;

      await service.processBioRecord(player_id, playerRecord);
      expect(mockParseBioData).toHaveBeenCalledWith(playerRecord);
      expect(mockRecordExists).toHaveBeenCalledWith(NFLSchema, BioTable, PlayerId, player_id);

      const { birth_date, ...stripBirthDate }: BioData = bioData;
      noBirthDate = stripBirthDate as BioData;
      noBirthDate.player_id = player_id;
      expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, BioTable, noBirthDate);

      mockParseBioData.mockRestore();
      mockRecordExists.mockRestore();
      mockInsertRecord.mockRestore();
    });    

    it('processBioRecord should catch and throw the error', async () => {
      const error = new Error("error");
      const mockParseBioData = jest.spyOn(NFLPlayerService.prototype, 'parseBioData').mockImplementation(() => bioData);
      const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation().mockRejectedValue(error);

      await expect(service.processBioRecord(1, playerRecord)).rejects.toThrow(error);
      expect(mockParseBioData).toHaveBeenCalledWith(playerRecord);
      mockParseBioData.mockRestore();
      mockRecordExists.mockRestore();
    });    
  });

  describe('parseLeagueData', () => {
    it.each([
      ["", ""],
      ["1", ""],
      ["", "1"],
      ["1", "1"],
    ])('should run parseLeagueData successfully - jersey: "%s", experience: "%s"', (jersey, experience) => {
      const data = playerRecord;
      data.jersey_number = jersey;
      data.years_of_experience = experience;
      
      const result = leagueData;
      result.player_id = 0;
      result.jersey_number = (data.jersey_number === "") ? null : data.jersey_number,
      result.years_of_experience = (data.years_of_experience === "") ? null : data.years_of_experience,

      expect(service.parseLeagueData(data)).toEqual(result);
    });
  });

  describe('parseBioData', () => {
    it.each([
      [false, "", ""],
      [false, "1", ""],
      [false, "", "1"],
      [false, "1", "1"],
      [true, "", ""],
    ])('should run parseBioData successfully - %s, %s, %s', (valid, height, weight) => {
      const mockIsValidDateFormat = jest.spyOn(DBService.prototype, 'isValidDateFormat').mockImplementation(() => valid);
      
      const data = playerRecord;
      data.height = height;
      data.weight = weight;

      const result = bioData;
      result.player_id = 0;
      result.height = (data.height === "") ? null : data.height;
      result.weight = (data.weight === "") ? null : data.weight;

      if (valid) {
        result.birth_date = data.birth_date;
      }
      else {
        result.birth_date = null;
      }

      expect(service.parseBioData(data)).toEqual(result);

      mockIsValidDateFormat.mockRestore();
    });
  });

  describe('parsePlayerData', () => {
    it('should run parsePlayerData successfully', () => {
      expect(service.parsePlayerData(playerRecord)).toEqual(playerData);
    });
  });
});