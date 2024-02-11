"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbService_1 = require("../../src/database/dbService");
const configData_1 = require("../../src/config/configData");
const logger_1 = require("../../src/log/logger");
const log_enums_1 = require("../../src/log/log.enums");
const pg_1 = require("pg");
jest.mock('../../src/config/configData');
jest.mock('../../src/log/logger');
jest.mock('pg');
describe('DBService', () => {
    let dbService;
    let mockPoolQuery;
    let mockConsoleError;
    beforeAll(() => {
        // Mock the pool.query method
        mockPoolQuery = jest.fn();
        pg_1.Pool.prototype.query = mockPoolQuery;
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    beforeEach(() => {
        // Clear mock calls and reset configuration mock
        jest.clearAllMocks();
        configData_1.getConfigurationData.mockReturnValue({
            database: {
                host: 'test-host',
                port: 5432,
                database: 'test-database',
                username: 'test-username',
                password: 'test-password',
            },
        });
        dbService = new dbService_1.DBService();
    });
    describe('constructor', () => {
        it('should create a pool and log connection information', () => {
            expect(logger_1.logger.debug).toHaveBeenCalledWith('Connecting to database: test-host:5432/test-database', log_enums_1.LogContext.dbService);
            expect(pg_1.Pool).toHaveBeenCalledWith({
                user: 'test-username',
                host: 'test-host',
                database: 'test-database',
                password: 'test-password',
                port: 5432,
            });
        });
    });
    describe('recordExists', () => {
        it('should return true if a record exists', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ exists: true }] });
            const result = await dbService.recordExists('schema', 'table', 'keyColumn', 'key');
            expect(result).toBe(true);
            expect(logger_1.logger.debug).toHaveBeenCalledTimes(1);
        });
        it('should return false if a record does not exist', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });
            const result = await dbService.recordExists('schema', 'table', 'keyColumn', 'key');
            expect(result).toBe(false);
            expect(logger_1.logger.debug).toHaveBeenCalledTimes(1);
        });
        it('should log and throw an error if query fails', async () => {
            const error = new Error('Query failed');
            const query = `SELECT EXISTS(SELECT 1 FROM schema.table WHERE keyColumn = $1) as "exists"`;
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.recordExists('schema', 'table', 'keyColumn', 'key')).rejects.toThrow(error);
            expect(logger_1.logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${['key']}'`, log_enums_1.LogContext.dbService);
            expect(logger_1.logger.error).toHaveBeenCalledWith('Unable to find record: ', error.message, log_enums_1.LogContext.dbService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });
    describe('recordLookup', () => {
        it('should return id if a record exists', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 100 }] });
            const result = await dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id');
            expect(result).toBe(100);
            expect(logger_1.logger.debug).toHaveBeenCalledTimes(1);
        });
        it('should return 0 if a record does not exist', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [] });
            const result = await dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id');
            expect(result).toBe(0);
            expect(logger_1.logger.debug).toHaveBeenCalledTimes(1);
        });
        it('should log and throw an error if query fails', async () => {
            const error = new Error('Query failed');
            const query = `SELECT id FROM schema.table WHERE keyColumn = $1`;
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.recordLookup('schema', 'table', 'keyColumn', 'key', 'id')).rejects.toThrow(error);
            expect(logger_1.logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${['key']}'`, log_enums_1.LogContext.dbService);
            expect(logger_1.logger.error).toHaveBeenCalledWith('Unable to lookup record: ', error.message, log_enums_1.LogContext.dbService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });
    describe('isValidDateFormat', () => {
        it.each([
            [null, false],
            ['', false],
            ['2001/01/12', true],
            ['2001-01-12', true],
            ['2001-01/12', false],
            ['2001/01-12', false],
            ['0000/00/00', false],
            ['a111/11/11', false],
            ['1a11/11/11', false],
            ['11a1/11/11', false],
            ['111a/11/11', false],
            ['1111/a1/11', false],
            ['1111/1a/11', false],
            ['1111/11/a1', false],
            ['1111/11/1a', false],
            ['01/12/2001', true],
            ['01-12-2001', true],
            ['0000-00-00', false],
            ['a111-11-11', false],
            ['1a11-11-11', false],
            ['11a1-11-11', false],
            ['111a-11-11', false],
            ['1111-a1-11', false],
            ['1111-1a-11', false],
            ['1111-11-a1', false],
            ['1111-11-1a', false],
            ['2001-01-12T00:00:00.000Z', true],
            ['2a01-01-12T00:00:00.000Z', false],
            ['20a1-01-12T00:00:00.000Z', false],
            ['200a-01-12T00:00:00.000Z', false],
            ['2001-a1-12T00:00:00.000Z', false],
            ['2001-0a-12T00:00:00.000Z', false],
            ['2001-01-a2T00:00:00.000Z', false],
            ['2001-01-1aT00:00:00.000Z', false],
            ['2001-01-12S00:00:00.000Z', false],
            ['2001-01-12Ta0:00:00.000Z', false],
            ['2001-01-12T0a:00:00.000Z', false],
            ['2001-01-12T00:a0:00.000Z', false],
            ['2001-01-12T00:0a:00.000Z', false],
            ['2001-01-12T00:00:a0.000Z', false],
            ['2001-01-12T00:00:0a.000Z', false],
            ['2001-01-12T00:00:00.a00Z', false],
            ['2001-01-12T00:00:00.0a0Z', false],
            ['2001-01-12T00:00:00.00aZ', false],
            ['2001-01-12T00:00:00.000Y', false],
        ])('should return if date is valid - %s, %s', async (dateValue, result) => {
            expect(dbService.isValidDateFormat(dateValue)).toBe(result);
        });
    });
    describe('insertRecord', () => {
        it('should return id if a record was inserted', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 100 }] });
            const result = await dbService.insertRecord('schema', 'table', { col: "value" });
            expect(result).toBe(100);
            expect(logger_1.logger.debug).toHaveBeenCalledTimes(2);
            expect(logger_1.logger.debug).toHaveBeenNthCalledWith(2, `New Record Id [100] inserted successfully into 'schema.table'.`, log_enums_1.LogContext.dbService);
        });
        it.each([
            [{ colA: "val1" }],
            [{ colA: "val1", colB: "val2" }],
            [{}],
        ])('should log and throw an error if query fails - %s', async (newData) => {
            const error = new Error('Insert failed');
            const columns = Object.keys(newData).join(', ');
            const values = Object.values(newData);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            const query = `INSERT INTO schema.table (${columns}) VALUES (${placeholders}) RETURNING *`;
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.insertRecord('schema', 'table', newData)).rejects.toThrow(error);
            expect(logger_1.logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${values}'`, log_enums_1.LogContext.dbService);
            expect(logger_1.logger.error).toHaveBeenCalledWith(`Unable to insert new record into 'schema.table'.`, error.message, log_enums_1.LogContext.dbService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });
    describe('updateRecord', () => {
        it('should successfully update record', async () => {
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 100 }] });
            await dbService.updateRecord('schema', 'table', 'keyColumn', 100, { col: "value" });
            expect(logger_1.logger.debug).toHaveBeenCalledTimes(2);
            expect(logger_1.logger.debug).toHaveBeenNthCalledWith(2, `Record with 'keyColumn' = '100' updated successfully in 'schema.table'.`, log_enums_1.LogContext.dbService);
        });
        it.each([
            [{ colA: "val1" }],
            [{ colA: "val1", colB: "val2" }],
            [{}],
        ])('should log and throw an error if query fails - %s', async (newData) => {
            const error = new Error('Update failed');
            const setClause = Object.keys(newData)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(', ');
            const values = Object.values(newData);
            const query = `UPDATE schema.table SET ${setClause} WHERE keyColumn = 100`;
            mockPoolQuery.mockRejectedValueOnce(error);
            await expect(dbService.updateRecord('schema', 'table', 'keyColumn', 100, newData)).rejects.toThrow(error);
            expect(logger_1.logger.debug).toHaveBeenCalledWith(`Failed Query: '${query}' - Values: '${values}'`, log_enums_1.LogContext.dbService);
            expect(logger_1.logger.error).toHaveBeenCalledWith(`Unable to update record with 'keyColumn' = '100' in 'schema.table'.`, error.message, log_enums_1.LogContext.dbService);
            expect(mockConsoleError).toHaveBeenCalledWith('Error: ', error);
        });
    });
});
