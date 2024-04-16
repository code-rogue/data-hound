import { LogContext } from '@log/log.enums';
import { logger } from '@log/logger';

import { NFLPlayerService } from '@data-services/nfl/playerService';
import { NFLWeeklyStatOffService } from '@data-services/nfl/weeklyStats/weeklyStatOffService';
import { NFLWeeklyStatDefService } from '@data-services/nfl/weeklyStats/weeklyStatDefService';
import { NFLWeeklyStatKickService } from '@data-services/nfl/weeklyStats/weeklyStatKickService';
import { NFLWeeklyAdvStatPassService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatPassService';
import { NFLWeeklyAdvStatRecService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatRecService';
import { NFLWeeklyAdvStatRushService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatRushService';
import { NFLWeeklyAdvStatDefService } from '@data-services/nfl/weeklyAdvStats/weeklyAdvStatDefService';
import { NFLWeeklyNextGenStatPassService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatPassService';
import { NFLWeeklyNextGenStatRecService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatRecService';
import { NFLWeeklyNextGenStatRushService } from '@data-services/nfl/weeklyNextGenStats/weeklyNextGenStatRushService';
import { NFLSeasonAdvStatDefService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatDefService';
import { NFLSeasonAdvStatPassService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatPassService';
import { NFLSeasonAdvStatRecService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatRecService';
import { NFLSeasonAdvStatRushService } from '@data-services/nfl/seasonAdvStats/seasonAdvStatRushService';

import { runServices } from '@src/service/services'; 

// Mock the logger functions to prevent actual logging during tests
jest.mock('@log/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}));

let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
let mockPlayer: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyOff: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyDef: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyKick: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyAdvDef: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyAdvPass: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyAdvRec: jest.SpyInstance<Promise<void>, [], any>;
let mockWeeklyAdvRush: jest.SpyInstance<Promise<void>, [], any>;
let mockNgPass: jest.SpyInstance<Promise<void>, [], any>;
let mockNgRec: jest.SpyInstance<Promise<void>, [], any>;
let mockNgRush: jest.SpyInstance<Promise<void>, [], any>;
let mockseasonAdvDef: jest.SpyInstance<Promise<void>, [], any>;
let mockseasonAdvPass: jest.SpyInstance<Promise<void>, [], any>;
let mockseasonAdvRec: jest.SpyInstance<Promise<void>, [], any>;
let mockseasonAdvRush: jest.SpyInstance<Promise<void>, [], any>;

describe('runServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPlayer = jest.spyOn(NFLPlayerService.prototype, 'runService').mockImplementation();
    mockWeeklyOff = jest.spyOn(NFLWeeklyStatOffService.prototype, 'runService').mockImplementation();
    mockWeeklyDef = jest.spyOn(NFLWeeklyStatDefService.prototype, 'runService').mockImplementation();
    mockWeeklyKick = jest.spyOn(NFLWeeklyStatKickService.prototype, 'runService').mockImplementation();
    mockWeeklyAdvDef = jest.spyOn(NFLWeeklyAdvStatPassService.prototype, 'runService').mockImplementation();
    mockWeeklyAdvPass = jest.spyOn(NFLWeeklyAdvStatRecService.prototype, 'runService').mockImplementation();
    mockWeeklyAdvRec = jest.spyOn(NFLWeeklyAdvStatRushService.prototype, 'runService').mockImplementation();
    mockWeeklyAdvRush = jest.spyOn(NFLWeeklyAdvStatDefService.prototype, 'runService').mockImplementation();
    mockNgPass = jest.spyOn(NFLWeeklyNextGenStatPassService.prototype, 'runService').mockImplementation();
    mockNgRec = jest.spyOn(NFLWeeklyNextGenStatRecService.prototype, 'runService').mockImplementation();
    mockNgRush = jest.spyOn(NFLWeeklyNextGenStatRushService.prototype, 'runService').mockImplementation();
    mockseasonAdvDef = jest.spyOn(NFLSeasonAdvStatDefService.prototype, 'runService').mockImplementation();
    mockseasonAdvPass = jest.spyOn(NFLSeasonAdvStatPassService.prototype, 'runService').mockImplementation();
    mockseasonAdvRec = jest.spyOn(NFLSeasonAdvStatRecService.prototype, 'runService').mockImplementation();
    mockseasonAdvRush = jest.spyOn(NFLSeasonAdvStatRushService.prototype, 'runService').mockImplementation();
  });

  it('should not run any services', async () => {
    const options = {
        schedule: false,
        players: false,
        weeklyOffense: false,
        weeklyDefense: false,
        weeklyKick: false,
        weeklyAdvDefense: false,
        weeklyAdvPass: false,
        weeklyAdvRec: false,
        weeklyAdvRush: false,
        nextGenPass: false,
        nextGenRec: false,
        nextGenRush: false,
        seasonAdvDef: false,
        seasonAdvPass: false,
        seasonAdvRec: false,
        seasonAdvRush: false,
    };

    await runServices(options);

    // Assert that the services are called based on the provided options
    expect(mockPlayer).not.toHaveBeenCalled();
    expect(mockWeeklyOff).not.toHaveBeenCalled();
    expect(mockWeeklyDef).not.toHaveBeenCalled();
    expect(mockWeeklyKick).not.toHaveBeenCalled();
    expect(mockWeeklyAdvDef).not.toHaveBeenCalled();
    expect(mockWeeklyAdvPass).not.toHaveBeenCalled();
    expect(mockWeeklyAdvRec).not.toHaveBeenCalled();
    expect(mockWeeklyAdvRush).not.toHaveBeenCalled();
    expect(mockNgPass).not.toHaveBeenCalled();
    expect(mockNgRec).not.toHaveBeenCalled();
    expect(mockNgRush).not.toHaveBeenCalled();
    expect(mockseasonAdvDef).not.toHaveBeenCalled();
    expect(mockseasonAdvPass).not.toHaveBeenCalled();
    expect(mockseasonAdvRec).not.toHaveBeenCalled();
    expect(mockseasonAdvRush).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('Running services...', LogContext.Service);
    expect(logger.debug).toHaveBeenCalledWith('Completed processing services.', LogContext.Service);
    expect(logger.error).not.toHaveBeenCalled(); // No errors should be logged
  });

  it('should run all services', async () => {
    const options = {
        schedule: false,
        players: true,
        weeklyOffense: true,
        weeklyDefense: true,
        weeklyKick: true,
        weeklyAdvDefense: true,
        weeklyAdvPass: true,
        weeklyAdvRec: true,
        weeklyAdvRush: true,
        nextGenPass: true,
        nextGenRec: true,
        nextGenRush: true,
        seasonAdvDef: true,
        seasonAdvPass: true,
        seasonAdvRec: true,
        seasonAdvRush: true,
    };

    await runServices(options);

    // Assert that the services are called based on the provided options
    expect(mockPlayer).toHaveBeenCalled();
    expect(mockWeeklyOff).toHaveBeenCalled();
    expect(mockWeeklyDef).toHaveBeenCalled();
    expect(mockWeeklyKick).toHaveBeenCalled();
    expect(mockWeeklyAdvDef).toHaveBeenCalled();
    expect(mockWeeklyAdvPass).toHaveBeenCalled();
    expect(mockWeeklyAdvRec).toHaveBeenCalled();
    expect(mockWeeklyAdvRush).toHaveBeenCalled();
    expect(mockNgPass).toHaveBeenCalled();
    expect(mockNgRec).toHaveBeenCalled();
    expect(mockNgRush).toHaveBeenCalled();
    expect(mockseasonAdvDef).toHaveBeenCalled();
    expect(mockseasonAdvPass).toHaveBeenCalled();
    expect(mockseasonAdvRec).toHaveBeenCalled();
    expect(mockseasonAdvRush).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('Running services...', LogContext.Service);
    expect(logger.debug).toHaveBeenCalledWith('Completed processing services.', LogContext.Service);
    expect(logger.error).not.toHaveBeenCalled(); // No errors should be logged
  });

  it('should catch and log error', async () => {
    const options = {
        schedule: false,
        players: true,
        weeklyOffense: false,
        weeklyDefense: false,
        weeklyKick: false,
        weeklyAdvDefense: false,
        weeklyAdvPass: false,
        weeklyAdvRec: false,
        weeklyAdvRush: false,
        nextGenPass: false,
        nextGenRec: false,
        nextGenRush: false,
        seasonAdvDef: false,
        seasonAdvPass: false,
        seasonAdvRec: false,
        seasonAdvRush: false,
    };

    const error = new Error("error");
    const mockPlayer = jest.spyOn(NFLPlayerService.prototype, 'runService').mockRejectedValue(error);

    await runServices(options);
    expect(logger.debug).toHaveBeenCalledWith('Running services...', LogContext.Service);
    expect(mockPlayer).toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
    expect(logger.error).toHaveBeenCalledWith('Error: ', error.message, LogContext.Service);
  });
});