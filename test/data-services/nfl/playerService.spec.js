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
const playerService_1 = require("../../../src/data-services/nfl/playerService");
const cd = __importStar(require("../../../src/config/configData"));
const csv = __importStar(require("../../../src/csv/csvService"));
const log_enums_1 = require("../../../src//log/log.enums");
const logger_1 = require("../../../src/log/logger");
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
    describe('runService', () => {
        it('should run the service successfully', async () => {
            const mockProcessPlayerData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processPlayerData').mockImplementation();
            await service.runService();
            expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
            expect(logger_1.logger.log).toHaveBeenCalledWith('NFL Player Service started...', log_enums_1.LogContext.NFLPlayerService);
            expect(mockParseCSV).toHaveBeenCalledWith(player_constants_1.dataFile, player_constants_1.configData.nfl.players.columns);
            expect(mockProcessPlayerData).toHaveBeenCalledWith(player_constants_1.data);
            mockProcessPlayerData.mockRestore();
        });
        it('should catch and log the error', async () => {
            const error = new Error("error");
            const mockProcessPlayerData = jest.spyOn(playerService_1.NFLPlayerService.prototype, 'processPlayerData').mockRejectedValue(error);
            await service.runService();
            expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
            expect(logger_1.logger.log).toHaveBeenCalledWith('NFL Player Service started...', log_enums_1.LogContext.NFLPlayerService);
            expect(mockParseCSV).toHaveBeenCalledWith(player_constants_1.dataFile, player_constants_1.configData.nfl.players.columns);
            expect(mockProcessPlayerData).toHaveBeenCalledWith(player_constants_1.data);
            expect(logger_1.logger.error).toHaveBeenCalledWith('NFL Player Service did not complete', error.message, log_enums_1.LogContext.NFLPlayerService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
            mockProcessPlayerData.mockRestore();
        });
    });
});
