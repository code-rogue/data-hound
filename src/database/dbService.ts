import { Config } from '../config/config';
import { getConfigurationData } from '../config/configData'
import { logger } from '../log/logger'
import { LogContext } from '../log/log.enums';
import { Pool, QueryResult } from 'pg';

export class DBService {
    public pool: Pool;
    public config: Config;

    constructor() {
        this.config = getConfigurationData();
        logger.debug(`Connecting to database: ${this.config.database.host}:${this.config.database.port}/${this.config.database.database}`, LogContext.DBService);

        // Set up PostgreSQL connection pool
        this.pool = new Pool({
            user: this.config.database.username,
            host: this.config.database.host,
            database: this.config.database.database,
            password: this.config.database.password,
            port: this.config.database.port,
        });
    }

    public async recordExists(schema: string, tableName: string, keyColumn: string, key: number | string): Promise<boolean> {
        const query = `SELECT EXISTS(SELECT 1 FROM ${schema}.${tableName} WHERE ${keyColumn} = $1) as "exists"`;
        try {
            const result = await this.pool.query(query, [key]);
            return result.rows[0].exists;
        } catch (error: any) {
            logger.debug(`Failed Query: '${query}' - Values: '${key}'`, LogContext.DBService);
            logger.error('Unable to find record: ', error.message, LogContext.DBService);
            console.error("Error: ", error);
            throw error;
        }
    }

    public async fetchRecords<T>(
        query: string, 
        keys: (number |string)[], 
    ): Promise<[T] | undefined> {
        try {
            const result = await this.pool.query(query, keys);
            return result?.rows as [T] | undefined;
        } catch (error: any) {
            logger.debug(`Failed Query: '${query}' - Values: '${keys.toString()}'`, LogContext.DBService);
            logger.error('Unable to fetch records: ', error.message, LogContext.DBService);
            console.error("Error: ", error);
            throw error;
        }
    }
    
    public async recordLookup(schema: string, tableName: string, keyColumn: string, key: number | string, idColumn: string): Promise<number> {
        const query = `SELECT ${idColumn} FROM ${schema}.${tableName} WHERE ${keyColumn} = $1`;
        try {
            const result = await this.pool.query(query, [key]);
            if(result && result.rows[0])
                return result.rows[0][idColumn];

            return 0;
        } catch (error: any) {
            logger.debug(`Failed Query: '${query}' - Values: '${key}'`, LogContext.DBService);
            logger.error('Unable to lookup record: ', error.message, LogContext.DBService);
            console.error("Error: ", error);
            throw error;
        }
    }

    public isValidDateFormat(dateString: string | null): boolean {
        if(!dateString)
            return false;

        const iso8601Regex = /^(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?)$/;
        const shortDateFormatRegex = /^(1[012]|0[1-9])([\/\-])(0[1-9]|[12]\d|3[01])\2((?:19|20)?\d{2})$/;
        const shortDateReversedFormatRegex = /^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/;
      
        return (
          iso8601Regex.test(dateString) ||
          shortDateFormatRegex.test(dateString) ||
          shortDateReversedFormatRegex.test(dateString)
        );
    }

    public async insertRecord(schema: string, tableName: string, newData: any): Promise<number> {
        const columns = Object.keys(newData).join(', ');
        const values = Object.values(newData);      
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const query = `INSERT INTO ${schema}.${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
        
        try {
            const result = await this.pool.query(query, values);
            logger.debug(`New Record Id [${result.rows[0].id}] inserted successfully into '${schema}.${tableName}'.`,LogContext.DBService);
            return result.rows[0].id;

        } catch(error: any) {
            logger.debug(`Failed Query: '${query}' - Values: '${values}'`, LogContext.DBService);
            logger.error(`Unable to insert new record into '${schema}.${tableName}'.`, error.message, LogContext.DBService);
            console.error("Error: ", error);
            throw error;
        };
      }

    public async updateRecord(schema: string, tableName: string, keyColumn: string, key: number, newData: any): Promise<void> {
        const setClause = Object.keys(newData)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(', ');
      
        const values = Object.values(newData);
        const query = `UPDATE ${schema}.${tableName} SET ${setClause} WHERE ${keyColumn} = ${key}`;
        try {
            await this.pool.query(query, values);
            logger.debug(`Record with '${keyColumn}' = '${key}' updated successfully in '${schema}.${tableName}'.`,LogContext.DBService);
        } catch(error: any) {
            logger.debug(`Failed Query: '${query}' - Values: '${values}'`, LogContext.DBService);
            logger.error(`Unable to update record with '${keyColumn}' = '${key}' in '${schema}.${tableName}'.`, error.message, LogContext.DBService);
            console.error("Error: ", error);
            throw error;
        };
    }
}