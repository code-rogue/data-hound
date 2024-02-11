"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cd = __importStar(require("../../../src/config/configData"));
const csv = __importStar(require("../../../src/csv/csvService"));
const dbService_1 = require("../../../src/database/dbService");
const log_enums_1 = require("../../../src/log/log.enums");
const logger_1 = require("../../../src/log/logger");
const playerService_1 = require("../../../src/data-services/nfl/playerService");
const player_constants_1 = require("./player.constants");
jest.mock('../../../src/log/logger');
let mockConsoleError;
let mockGetConfigurationData;
let mockDownloadCSV;
let mockParseCSV;
let service;
describe('NFLPlayerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(player_constants_1.configData);
        mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(player_constants_1.dataFile);
        mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(player_constants_1.data);
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        service = new playerService_1.NFLPlayerService();
    });
    describe('processPlayerData', () => {
        it.each([
            [player_constants_1.noData],
            [player_constants_1.data],
            [[player_constants_1.playerRecord, player_constants_1.playerRecord]],
        ])('should run processPlayerData successfully', async (data) => {
            const mockProcessPlayerDataRow = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processPlayerDataRow').mockImplementation();
            await service.processPlayerData(data);
            expect(logger_1.logger.log).toHaveBeenCalledWith(`Processing player records [${data.length}]`, log_enums_1.LogContext.NFLPlayerService);
            expect(mockProcessPlayerDataRow).toHaveBeenCalledTimes(data.length);
            data.forEach(row => {
                expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(row);
            });
            expect(logger_1.logger.log).toHaveBeenCalledWith('Processed player records.', log_enums_1.LogContext.NFLPlayerService);
            mockProcessPlayerDataRow.mockRestore();
        });
        it.skip('processPlayerData should catch and log the error', async () => {
            const error = new Error("error");
            const mockProcessPlayerDataRow = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processPlayerDataRow').mockRejectedValue(error);
            await expect(service.processPlayerData(player_constants_1.data)).rejects.toThrow(error);
            expect(logger_1.logger.log).toHaveBeenCalledWith(`Processing player records [1]`, log_enums_1.LogContext.NFLPlayerService);
            expect(mockProcessPlayerDataRow).toHaveBeenCalledWith(player_constants_1.playerRecord);
            expect(logger_1.logger.error).toHaveBeenCalledWith('NFL Player Service did not complete', error.message, log_enums_1.LogContext.NFLPlayerService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
            // Await the logger.debug call
            await new Promise(resolve => process.nextTick(resolve));
            expect(logger_1.logger.log).toHaveBeenCalledWith('Processed player records.', log_enums_1.LogContext.NFLPlayerService);
            mockProcessPlayerDataRow.mockRestore();
        });
    });
    describe('processPlayerDataRow', () => {
        it.each([
            [0, true, player_constants_1.playerRecord],
            [1001, false, player_constants_1.playerRecord],
        ])('should run processPlayerDataRow successfully - id: "%s", insert: "$s"', async (player_id, bInsert, row) => {
            let id = player_id;
            const mockParsePlayerData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parsePlayerData').mockImplementation(() => player_constants_1.playerData);
            const mockRecordLookup = jest.spyOn(dbService_1.DBService.prototype, 'recordLookup')
                .mockImplementation(() => Promise.resolve(player_id));
            const mockUpdateRecord = jest.spyOn(dbService_1.DBService.prototype, 'updateRecord').mockImplementation();
            const mockInsertRecord = jest.spyOn(dbService_1.DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
            const mockProcessBioRecord = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processBioRecord').mockImplementation();
            const mockProcessLeagueRecord = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processLeagueRecord').mockImplementation();
            await service.processPlayerDataRow(row);
            expect(mockParsePlayerData).toHaveBeenCalledWith(row);
            expect(mockRecordLookup).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.PlayerTable, playerService_1.PlayerGUID, player_constants_1.playerData.smart_id, 'id');
            if (bInsert) {
                expect(mockInsertRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.PlayerTable, player_constants_1.playerData);
                id++;
            }
            else {
                expect(mockUpdateRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.PlayerTable, 'id', player_id, player_constants_1.playerData);
            }
            expect(mockProcessBioRecord).toHaveBeenCalledWith(id, row);
            expect(mockProcessLeagueRecord).toHaveBeenCalledWith(id, row);
            // Await the logger.debug call
            await new Promise(resolve => process.nextTick(resolve));
            expect(logger_1.logger.debug).toHaveBeenNthCalledWith(2, `Completed processing player record: ${JSON.stringify(row)}.`, log_enums_1.LogContext.NFLPlayerService);
            mockParsePlayerData.mockRestore();
            mockRecordLookup.mockRestore();
            mockUpdateRecord.mockRestore();
            mockInsertRecord.mockRestore();
            mockProcessBioRecord.mockRestore();
            mockProcessLeagueRecord.mockRestore();
        });
        it.skip('processPlayerDataRow should catch and throw the error', async () => {
            const error = new Error("error");
            const mockParsePlayerData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parsePlayerData').mockImplementation(() => player_constants_1.playerData);
            const mockRecordLookup = jest.spyOn(dbService_1.DBService.prototype, 'recordLookup').mockRejectedValue(error);
            await expect(service.processPlayerDataRow(player_constants_1.playerRecord)).rejects.toThrow(error);
            expect(mockParsePlayerData).toHaveBeenCalledWith(player_constants_1.playerRecord);
            mockParsePlayerData.mockRestore();
            mockRecordLookup.mockRestore();
        });
        it.skip('processPlayerDataRow Promise All should catch and throw the error', async () => {
            const error = new Error("error");
            const mockParsePlayerData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parsePlayerData').mockImplementation(() => player_constants_1.playerData);
            const mockRecordLookup = jest.spyOn(dbService_1.DBService.prototype, 'recordLookup')
                .mockImplementation(() => Promise.resolve(0));
            const mockInsertRecord = jest.spyOn(dbService_1.DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(1));
            const mockProcessBioRecord = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processBioRecord').mockRejectedValue(error);
            const mockProcessLeagueRecord = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processLeagueRecord').mockImplementation();
            await expect(service.processPlayerDataRow(player_constants_1.playerRecord)).rejects.toThrow(error);
            mockParsePlayerData.mockRestore();
            mockRecordLookup.mockRestore();
            mockInsertRecord.mockRestore();
            mockProcessBioRecord.mockRestore();
            mockProcessLeagueRecord.mockRestore();
        });
    });
    describe('processLeagueRecord', () => {
        it.each([
            [true, player_constants_1.playerRecord],
            [false, player_constants_1.playerRecord],
        ])('should run processLeagueRecord successfully - exists: "%s"', async (exists, row) => {
            const mockParseLeagueData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parseLeagueData').mockImplementation(() => player_constants_1.leagueData);
            const mockRecordExists = jest.spyOn(dbService_1.DBService.prototype, 'recordExists')
                .mockImplementation(() => Promise.resolve(exists));
            const mockUpdateRecord = jest.spyOn(dbService_1.DBService.prototype, 'updateRecord').mockImplementation();
            const mockInsertRecord = jest.spyOn(dbService_1.DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
            const player_id = (exists) ? 1 : 0;
            await service.processLeagueRecord(player_id, row);
            expect(mockParseLeagueData).toHaveBeenCalledWith(row);
            expect(mockRecordExists).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.LeagueTable, playerService_1.PlayerId, player_id);
            if (exists) {
                const { player_id, ...updateLeagueData } = player_constants_1.leagueData;
                expect(mockUpdateRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.LeagueTable, playerService_1.PlayerId, player_id, updateLeagueData);
            }
            else {
                const insertLeagueData = player_constants_1.leagueData;
                insertLeagueData.player_id = player_id;
                expect(mockInsertRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.LeagueTable, insertLeagueData);
            }
            mockParseLeagueData.mockRestore();
            mockRecordExists.mockRestore();
            mockUpdateRecord.mockRestore();
            mockInsertRecord.mockRestore();
        });
        it('processLeagueRecord should catch and throw the error', async () => {
            const error = new Error("error");
            const mockParseLeagueData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parseLeagueData').mockImplementation(() => player_constants_1.leagueData);
            const mockRecordExists = jest.spyOn(dbService_1.DBService.prototype, 'recordExists').mockImplementation().mockRejectedValue(error);
            await expect(service.processLeagueRecord(1, player_constants_1.playerRecord)).rejects.toThrow(error);
            expect(mockParseLeagueData).toHaveBeenCalledWith(player_constants_1.playerRecord);
            mockParseLeagueData.mockRestore();
            mockRecordExists.mockRestore();
        });
    });
    describe('processBioRecord', () => {
        it.each([
            [true, player_constants_1.playerRecord],
            [false, player_constants_1.playerRecord],
        ])('should run processBioRecord successfully - exists: "%s"', async (exists, row) => {
            const mockParseBioData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parseBioData').mockImplementation(() => player_constants_1.bioData);
            const mockRecordExists = jest.spyOn(dbService_1.DBService.prototype, 'recordExists')
                .mockImplementation(() => Promise.resolve(exists));
            const mockUpdateRecord = jest.spyOn(dbService_1.DBService.prototype, 'updateRecord').mockImplementation();
            const mockInsertRecord = jest.spyOn(dbService_1.DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
            const player_id = (exists) ? 1 : 0;
            await service.processBioRecord(player_id, row);
            expect(mockParseBioData).toHaveBeenCalledWith(row);
            expect(mockRecordExists).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.BioTable, playerService_1.PlayerId, player_id);
            if (exists) {
                const { player_id, ...updateBioData } = player_constants_1.bioData;
                expect(mockUpdateRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.BioTable, playerService_1.PlayerId, player_id, updateBioData);
            }
            else {
                const insertBioData = player_constants_1.bioData;
                insertBioData.player_id = player_id;
                expect(mockInsertRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.BioTable, insertBioData);
            }
            mockParseBioData.mockRestore();
            mockRecordExists.mockRestore();
            mockUpdateRecord.mockRestore();
            mockInsertRecord.mockRestore();
        });
        it('processBioRecord should parse out null birth_Date', async () => {
            const nullBirthDate = player_constants_1.bioData;
            nullBirthDate.birth_date = null;
            let noBirthDate = player_constants_1.bioData;
            const mockParseBioData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parseBioData').mockImplementation(() => nullBirthDate);
            const mockRecordExists = jest.spyOn(dbService_1.DBService.prototype, 'recordExists').mockImplementation(() => Promise.resolve(false));
            const mockInsertRecord = jest.spyOn(dbService_1.DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(player_id + 1));
            const player_id = 1;
            await service.processBioRecord(player_id, player_constants_1.playerRecord);
            expect(mockParseBioData).toHaveBeenCalledWith(player_constants_1.playerRecord);
            expect(mockRecordExists).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.BioTable, playerService_1.PlayerId, player_id);
            const { birth_date, ...stripBirthDate } = player_constants_1.bioData;
            noBirthDate = stripBirthDate;
            noBirthDate.player_id = player_id;
            expect(mockInsertRecord).toHaveBeenCalledWith(playerService_1.NFLSchema, playerService_1.BioTable, noBirthDate);
            mockParseBioData.mockRestore();
            mockRecordExists.mockRestore();
            mockInsertRecord.mockRestore();
        });
        it('processBioRecord should catch and throw the error', async () => {
            const error = new Error("error");
            const mockParseBioData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'parseBioData').mockImplementation(() => player_constants_1.bioData);
            const mockRecordExists = jest.spyOn(dbService_1.DBService.prototype, 'recordExists').mockImplementation().mockRejectedValue(error);
            await expect(service.processBioRecord(1, player_constants_1.playerRecord)).rejects.toThrow(error);
            expect(mockParseBioData).toHaveBeenCalledWith(player_constants_1.playerRecord);
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
            const data = player_constants_1.playerRecord;
            data.jersey_number = jersey;
            data.years_of_experience = experience;
            const result = player_constants_1.leagueData;
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
            const mockIsValidDateFormat = jest.spyOn(dbService_1.DBService.prototype, 'isValidDateFormat').mockImplementation(() => valid);
            const data = player_constants_1.playerRecord;
            data.height = height;
            data.weight = weight;
            const result = player_constants_1.bioData;
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
            expect(service.parsePlayerData(player_constants_1.playerRecord)).toEqual(player_constants_1.playerData);
        });
    });
});
