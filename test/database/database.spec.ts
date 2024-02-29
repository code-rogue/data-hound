import { DBService } from '../../src/database/dbService';
import { getConfigurationData } from '../../src/config/configData';
import { logger } from '../../src/log/logger';
import { LogContext } from '../../src/log/log.enums';
import { Pool, QueryResult } from 'pg';

import {
    weeklyBioData as bioData,
    passData,
} from '../data-services/nfl/constants/config.constants';

import {
    NFLSchema,
    WeeklyPassTable,
    PlayerId,
    WeeklyStatId,
} from '../../src/constants/nfl/service.constants';

import type { 
    RecordData,
} from '../../src/interfaces/database/database';

jest.mock('../../src/config/configData');
jest.mock('../../src/log/logger');
jest.mock('pg');

describe('DBService', () => {
    let dbService: DBService;
    let mockPoolQuery: jest.Mock;
    let mockConsoleError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]], any>;
        
    beforeAll(() => {
        // Mock the pool.query method
        mockPoolQuery = jest.fn();
        (Pool.prototype.query as jest.Mock) = mockPoolQuery;

        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    beforeEach(() => {
        // Clear mock calls and reset configuration mock
        jest.clearAllMocks();
            (getConfigurationData as jest.Mock).mockReturnValue({
            database: {
                host: 'test-host',
                port: 5432,
                database: 'test-database',
                username: 'test-username',
                password: 'test-password',
            },
        });

        dbService = new DBService();
    });

    describe('constructor', () => {
        it('should create a pool and log connection information', () => {
            expect(logger.debug).toHaveBeenCalledWith(
                'Connecting to database: test-host:5432/test-database',
                LogContext.DBService
            );
            expect(Pool).toHaveBeenCalledWith({
                user: 'test-username',
                host: 'test-host',
                database: 'test-database',
                password: 'test-password',
                port: 5432,
            });
        });
    });

    describe('fetchRecords', () => {
        const queryResult = { rows: [{ id: 1, key: 'value' }] } as QueryResult;
        const emptyResults = { rows: [] } as unknown as QueryResult;
        const undefinedResults = { } as unknown as QueryResult;
        it.each([
            ['', [], undefinedResults],
            ['SELECT * FROM x', [], queryResult],
            ['SELECT * FROM x WHERE a = $1 AND b = $2', ['a', 'b'], emptyResults]
        ])('should return records', async (query, keys, returnResults) => {
            mockPoolQuery.mockResolvedValueOnce(returnResults);
            const result = await dbService.fetchRecords<{id: number, key: string}>(query, keys);
            expect(result).toBe(returnResults?.rows ?? undefined);
            expect(mockPoolQuery).toHaveBeenCalledWith(query, keys);
        });

        it('should log and throw an error if query fails', async () => {
            const query = 'SELECT * FROM x WHERE a = $1';
            const keys = ['a']
            const error = new Error('Query failed');
            mockPoolQuery.mockRejectedValueOnce(error);

            await expect(dbService.fetchRecords(query, keys)).rejects.toThrow(error);
            expect(logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${keys}'`, LogContext.DBService);
            expect(logger.error).toHaveBeenCalledWith('Unable to fetch records: ', error.message, LogContext.DBService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });

    describe('recordExists', () => {
        it('should return true if a record exists', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ exists: true }] } as QueryResult);
            const result = await dbService.recordExists('schema', 'table', 'keyColumn', 'key');
            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it('should return false if a record does not exist', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ exists: false }] } as QueryResult);
            const result = await dbService.recordExists('schema', 'table', 'keyColumn', 'key');
            expect(result).toBe(false);
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it('should log and throw an error if query fails', async () => {
            const error = new Error('Query failed');
            const query = `SELECT EXISTS(SELECT 1 FROM schema.table WHERE keyColumn = $1) as "exists"`;
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.recordExists('schema', 'table', 'keyColumn', 'key')).rejects.toThrow(error);
            expect(logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${['key']}'`, LogContext.DBService);
            expect(logger.error).toHaveBeenCalledWith('Unable to find record: ', error.message, LogContext.DBService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });

    describe('recordLookup', () => {
        it('should return id if a record exists', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 100 }] } as QueryResult);
            const result = await dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id');
            expect(result).toBe(100);
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it('should return 0 if a record does not exist', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult);
            const result = await dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id');
            expect(result).toBe(0);
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it('should return 0 if key is undefined', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult);
            const result = await dbService.recordLookup('schema', 'table', 'keyColumn', undefined, 'id');
            expect(result).toBe(0);
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it('should return 0 if a record does not exist', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [] } as unknown as QueryResult);
            const result = await dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id');
            expect(result).toBe(0);
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it('should log and throw an error if query fails', async () => {
            const error = new Error('Query failed');
            const query = `SELECT id FROM schema.table WHERE keyColumn = $1`;
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id')).rejects.toThrow(error);
            expect(logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${['key']}'`, LogContext.DBService);
            expect(logger.error).toHaveBeenCalledWith('Unable to lookup record: ', error.message, LogContext.DBService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });

    describe('isValidDateFormat', () => {
        it.each([
            [ null, false],
            [ '', false],
            [ '2001/01/12', true],
            [ '2001-01-12', true],
            [ '2001-01/12', false],
            [ '2001/01-12', false],
            [ '0000/00/00', false],
            [ 'a111/11/11', false],
            [ '1a11/11/11', false],
            [ '11a1/11/11', false],
            [ '111a/11/11', false],
            [ '1111/a1/11', false],
            [ '1111/1a/11', false],
            [ '1111/11/a1', false],
            [ '1111/11/1a', false],
            [ '01/12/2001', true],
            [ '01-12-2001', true],
            [ '0000-00-00', false],
            [ 'a111-11-11', false],
            [ '1a11-11-11', false],
            [ '11a1-11-11', false],
            [ '111a-11-11', false],
            [ '1111-a1-11', false],
            [ '1111-1a-11', false],
            [ '1111-11-a1', false],
            [ '1111-11-1a', false],
            [ '2001-01-12T00:00:00.000Z', true],
            [ '2a01-01-12T00:00:00.000Z', false],
            [ '20a1-01-12T00:00:00.000Z', false],
            [ '200a-01-12T00:00:00.000Z', false],
            [ '2001-a1-12T00:00:00.000Z', false],
            [ '2001-0a-12T00:00:00.000Z', false],
            [ '2001-01-a2T00:00:00.000Z', false],
            [ '2001-01-1aT00:00:00.000Z', false],
            [ '2001-01-12S00:00:00.000Z', false],
            [ '2001-01-12Ta0:00:00.000Z', false],
            [ '2001-01-12T0a:00:00.000Z', false],
            [ '2001-01-12T00:a0:00.000Z', false],
            [ '2001-01-12T00:0a:00.000Z', false],
            [ '2001-01-12T00:00:a0.000Z', false],
            [ '2001-01-12T00:00:0a.000Z', false],
            [ '2001-01-12T00:00:00.a00Z', false],
            [ '2001-01-12T00:00:00.0a0Z', false],
            [ '2001-01-12T00:00:00.00aZ', false],
            [ '2001-01-12T00:00:00.000Y', false],
        ])('should return if date is valid - %s, %s', async (dateValue, result) => {
            expect(dbService.isValidDateFormat(dateValue)).toBe(result);
        });
    });

    describe('insertRecord', () => {
        it('should return id if a record was inserted', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 100 }] } as QueryResult);
            const result = await dbService.insertRecord('schema', 'table', { col: "value" });
            expect(result).toBe(100);
            expect(logger.debug).toHaveBeenCalledTimes(2);
            expect(logger.debug).toHaveBeenNthCalledWith(2, `New Record Id [100] inserted successfully into 'schema.table'.`,LogContext.DBService);
        });

        it.each([
            [{ colA: "val1" }],
            [{ colA: "val1", colB: "val2" }],
            [{ }],
        ])('should log and throw an error if query fails - %s', async (newData) => {
            const error = new Error('Insert failed');

            const columns = Object.keys(newData).join(', ');
            const values = Object.values(newData);      
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            const query = `INSERT INTO schema.table (${columns}) VALUES (${placeholders}) RETURNING *`;
            
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.insertRecord('schema', 'table', newData)).rejects.toThrow(error);
            expect(logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${values}'`, LogContext.DBService);
            expect(logger.error).toHaveBeenCalledWith(`Unable to insert new record into 'schema.table'.`, error.message, LogContext.DBService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });

    describe('updateRecord', () => {
        it('should successfully update record', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 100 }] } as QueryResult);
            await dbService.updateRecord('schema', 'table', 'keyColumn', 100, { col: "value" });
            expect(logger.debug).toHaveBeenCalledTimes(2);
            expect(logger.debug).toHaveBeenNthCalledWith(2, `Record with 'keyColumn' = '100' updated successfully in 'schema.table'.`,LogContext.DBService);
        });

        it.each([
            [{ colA: "val1" }],
            [{ colA: "val1", colB: "val2" }],
            [{ }],
        ])('should log and throw an error if query fails - %s', async (newData) => {
            const error = new Error('Update failed');

            const setClause = Object.keys(newData)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(', ');
            const values = Object.values(newData);
            const query = `UPDATE schema.table SET ${setClause} WHERE keyColumn = 100`;
            
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.updateRecord('schema', 'table', 'keyColumn', 100, newData)).rejects.toThrow(error);
            expect(logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${values}'`, LogContext.DBService);
            expect(logger.error).toHaveBeenCalledWith(`Unable to update record with 'keyColumn' = '100' in 'schema.table'.`, error.message, LogContext.DBService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });

    describe('processRecord', () => {
        it.each([
            [true, passData, WeeklyStatId, 5],
            [false, bioData, PlayerId, 10],
        ])('should run successfully - exists: %s', async (exists, data, idColumn, id) => {
            const dataCopy = data;
            
            const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation(() => Promise.resolve(exists));
            const mockUpdateRecord = jest.spyOn(DBService.prototype, 'updateRecord').mockImplementation();
            const mockInsertRecord = jest.spyOn(DBService.prototype, 'insertRecord').mockImplementation(() => Promise.resolve(100));
    
            // @ts-ignore: (TS 2345) - idColumn is a keyof data
            const result = await dbService.processRecord(NFLSchema, WeeklyPassTable, idColumn, id, dataCopy);
            expect(mockRecordExists).toHaveBeenLastCalledWith(NFLSchema, WeeklyPassTable, idColumn, id);
    
            if (exists) {
                // @ts-ignore: (TS 2537) - idColumn is a keyof data
                const { [idColumn]: _, ...updatedData } = dataCopy;
                expect(mockUpdateRecord).toHaveBeenCalledWith(NFLSchema, WeeklyPassTable, idColumn, id, updatedData);
            } 
            else {
                const updatedData = dataCopy;
                (updatedData as RecordData)[idColumn as keyof RecordData] = id;
                expect(result).toEqual(100);
                expect(mockInsertRecord).toHaveBeenCalledWith(NFLSchema, WeeklyPassTable, dataCopy);
            }
    
            mockRecordExists.mockRestore();
            mockUpdateRecord.mockRestore();
            mockInsertRecord.mockRestore();
        });
    
        it('should catch and throw the error', async () => {
          const error = new Error("error");
          const mockRecordExists = jest.spyOn(DBService.prototype, 'recordExists').mockImplementation().mockRejectedValue(error);
    
          await expect(dbService.processRecord(NFLSchema, WeeklyPassTable, WeeklyStatId, 5, passData)).rejects.toThrow(error);
          
          mockRecordExists.mockRestore();
        });    
      });
});