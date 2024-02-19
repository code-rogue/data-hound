import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import {
  configData,
  dataFile,
  rawPlayerData as data,
 } from '../constants/config.constants';
 import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';
import { NFLPlayerService } from '../../../../src/data-services/nfl/playerService';

jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV;
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
      const mockProcessPlayerData = jest.spyOn(NFLPlayerService.prototype, 'processPlayerData').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Service started...', LogContext.NFLPlayerService)
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.players.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);

      mockProcessPlayerData.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerData = jest.spyOn(NFLPlayerService.prototype, 'processPlayerData').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Service started...', LogContext.NFLPlayerService)
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.players.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Service did not complete', error.message, LogContext.NFLPlayerService)
      
      mockProcessPlayerData.mockRestore();
    });
  });
});