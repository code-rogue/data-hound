import { DBService } from '../../../../src/database/dbService'
import * as util from '../../../../src/data-services/nfl/utils/utils';

import {
    NFLSchema,
    PlayerFullName,
    PlayerPFR,
    PlayerTable,
} from '../../../../src/constants/nfl/service.constants';

import { 
    NFLWeeklyAdvStatService,
 } from '../../../../src/data-services/nfl/advStatService';

import {
    advStatRecord,
    advStatGameData as gameData,
    advStatLeagueData as leagueData,
    advStatPlayerData as playerData,
} from '../constants/config.constants';

import type { 
  PlayerData,
} from '../../../../src/interfaces/nfl/stats';

import type {
  StringSplitResult,
} from '../../../../src/data-services/nfl/utils/utils';

jest.mock('../../../../src/log/logger');

let mockSplitString: jest.SpyInstance<util.StringSplitResult, [input: string | null | undefined, delimiter: string], any>;
let service: NFLWeeklyAdvStatService;

const splitStringData: StringSplitResult = {
  firstPart: '',
  secondPart: '',
};

describe('NFLWeeklyAdvStatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSplitString = jest.spyOn(util, 'splitString').mockImplementation(() => splitStringData);
    service = new NFLWeeklyAdvStatService();
  });

  describe('parsePlayerData', () => {
    it('should parse successfully', () => {
      const result = playerData
      result.first_name = splitStringData.firstPart;
      result.last_name = splitStringData.secondPart;
      expect(service.parsePlayerData(advStatRecord)).toEqual(result);
      expect(mockSplitString).toHaveBeenCalledWith(advStatRecord.full_name, ' ');
    });
  });

  describe('parseGameData', () => {
    it('should parse successfully', () => {
        const result = gameData;
        result.player_id = 0;
        expect(service.parseGameData(advStatRecord)).toEqual(result);
    });
  });
  
  describe('parseLeagueData', () => {
    it('should parse successfully', () => {
        const result = leagueData;
        result.player_id = 0;
        expect(service.parseLeagueData(advStatRecord)).toEqual(result);
    });
  });

  describe('findPlayer', () => {
    const query = `SELECT id FROM ${NFLSchema}.${PlayerTable} WHERE ${PlayerPFR} = $1 OR ${PlayerFullName} = $2`;
    const { pfr_id, ...noPFRIdData }: PlayerData = playerData;

    it.each([
      [1, playerData, {id: 1001}],
      [2, noPFRIdData as PlayerData, undefined],
    ])('should run successfully - idx: %s', async (idx, data, record) => {
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation(() => { 
        if(record)
          return Promise.resolve([record]); 

          return Promise.resolve([] as unknown as [unknown]);
      });

      const keys = [data.pfr_id ?? '', data.full_name];
      const player_id = await service.findPlayer(data);
      if(record)
        expect(player_id).toEqual(record.id);
      else
        expect(player_id).toEqual(0);

      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);

      mockFetchRecords.mockRestore();
    });

    it('should catch and throw the error', async () => {
      const error = new Error("error");
      const mockFetchRecords = jest.spyOn(DBService.prototype, 'fetchRecords').mockImplementation().mockRejectedValue(error);

      const keys = [playerData.pfr_id ?? '', playerData.full_name];
      await expect(service.findPlayer(playerData)).rejects.toThrow(error);
      expect(mockFetchRecords).toHaveBeenCalledWith(query, keys);
      
      mockFetchRecords.mockRestore();
    });    
  });
});