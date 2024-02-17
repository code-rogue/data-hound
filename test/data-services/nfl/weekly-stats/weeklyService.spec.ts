import { NFLWeeklyStatService } from '../../../../src/data-services/nfl/weeklyStatService';
import * as cd from '../../../../src/config/configData';
import * as csv from '../../../../src/csv/csvService';
import { Config } from '../../../../src/config/config';
import { LogContext } from '../../../../src/log/log.enums';
import { logger } from '../../../../src/log/logger';

import {
  configData,
  dataFile,
  rawWeeklyStatData as data,
 } from '../constants/config.constants';

 jest.mock('../../../../src/log/logger');

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockGetConfigurationData: jest.SpyInstance<Config, [], any>;
let mockDownloadCSV;
let mockParseCSV: jest.SpyInstance<Promise<unknown[]>, [filePath: string, columnMap: csv.ColumnMap], any>;
let service: NFLWeeklyStatService;

describe('NFLPlayerWeeklyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConfigurationData = jest.spyOn(cd, 'getConfigurationData').mockReturnValue(configData);
    mockDownloadCSV = jest.spyOn(csv, 'downloadCSV').mockResolvedValue(dataFile);
    mockParseCSV = jest.spyOn(csv, 'parseCSV').mockResolvedValue(data);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    service = new NFLWeeklyStatService();
  });

  describe('runService', () => {
    it('should run the service successfully', async () => {
      const mockProcessPlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'processPlayerData').mockImplementation();
      
      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Stats Service started...', LogContext.NFLWeeklyStatsService)
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.player_weekly_stats.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);

      mockProcessPlayerData.mockRestore();
    });

    it('should catch and log the error', async () => {
      const error = new Error("error");
      const mockProcessPlayerData = jest.spyOn(NFLWeeklyStatService.prototype, 'processPlayerData').mockRejectedValue(error);

      await service.runService();

      expect(mockGetConfigurationData).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('NFL Player Weekly Stats Service started...', LogContext.NFLWeeklyStatsService)
      expect(mockParseCSV).toHaveBeenCalledWith(dataFile, configData.nfl.player_weekly_stats.columns);
      expect(mockProcessPlayerData).toHaveBeenCalledWith(data);
      expect(logger.error).toHaveBeenCalledWith('NFL Player Weekly Stats Service did not complete', error.message, LogContext.NFLWeeklyStatsService)
      expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);

      mockProcessPlayerData.mockRestore();
    });
  });
});