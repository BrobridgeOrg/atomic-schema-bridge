const events = require('events');

class DatabaseClient extends events.EventEmitter {
    constructor(dbType, config) {
        super();
        this.dbType = dbType.toLowerCase();
        // 如果配置被包在 connection 屬性中，提取出來
        this.config = config.connection || config;
        this.poolConfig = config.pool || {};
        this.connection = null;
        this.pool = null;
        this.isConnected = false;
        this.status = 'disconnected';
        
        // 根據資料庫類型初始化驅動
        this.initializeDriver();
    }
    
    initializeDriver() {
        try {
            switch (this.dbType) {
                case 'mssql':
                    this.driver = require('mssql');
                    break;
                case 'postgres':
                    this.driver = require('pg');
                    break;
                case 'mysql':
                    this.driver = require('mysql2/promise');
                    break;
                case 'oracle':
                    this.driver = require('oracledb');
                    break;
                case 'informix':
                    this.driver = require('ibm_db');
                    break;
                default:
                    throw new Error(`Unsupported database type: ${this.dbType}`);
            }
        } catch (error) {
            this.emit('error', new Error(`Failed to load driver for ${this.dbType}: ${error.message}`));
        }
    }
    
    async connect() {
        try {
            switch (this.dbType) {
                case 'mssql':
                    await this.connectMSSQL();
                    break;
                case 'postgres':
                    await this.connectPostgres();
                    break;
                case 'mysql':
                    await this.connectMySQL();
                    break;
                case 'oracle':
                    await this.connectOracle();
                    break;
                case 'informix':
                    await this.connectInformix();
                    break;
                default:
                    throw new Error(`Unsupported database type: ${this.dbType}`);
            }
            
            this.isConnected = true;
            this.status = 'connected';
            this.emit('connected');
        } catch (error) {
            this.status = 'disconnected';
            this.emit('error', error);
        }
    }
    
    async connectMSSQL() {
        const config = {
            server: this.config.server,
            port: this.config.port || 1433,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            domain: this.config.domain,
            requestTimeout: this.config.requestTimeout || 15000,
            connectionTimeout: this.config.connectionTimeout || 15000,
            options: {
                encrypt: this.config.encryption || false,
                trustServerCertificate: this.config.trustServerCertificate || false,
                appName: this.config.appName || 'atomic-schema-bridge'
            }
        };
        
        this.pool = new this.driver.ConnectionPool(config);
        await this.pool.connect();
    }
    
    async connectPostgres() {
        const { Pool } = this.driver;
        
        const config = {
            host: this.config.server,
            port: this.config.port || 5432,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            max: this.config.maxConnections || 10
        };
        
        this.pool = new Pool(config);
    }
    
    async connectMySQL() {
        const config = {
            host: this.config.server,
            port: this.config.port || 3306,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        };
        
        this.connection = await this.driver.createConnection(config);
    }
    
    async connectOracle() {
        // 初始化 Oracle 客戶端
        if (this.config.oracleClientPath) {
            this.driver.initOracleClient({ libDir: this.config.oracleClientPath });
        }
        
        this.driver.autoCommit = true;
        this.driver.outFormat = this.driver.OUT_FORMAT_OBJECT;
        
        const config = {
            user: this.config.username,
            password: this.config.password,
            connectString: `${this.config.server}:${this.config.port || 1521}/${this.config.database}`,
            poolMin: this.config.poolMin || 1,
            poolMax: this.config.poolMax || 10,
            poolTimeout: this.config.poolTimeout || 60
        };
        
        this.pool = await this.driver.createPool(config);
    }
    
    async connectInformix() {
        const connectionString = this.buildInformixConnectionString();
        
        try {
            // 對於 IBM DB，我們直接打開連接而不使用連接池進行測試
            this.connection = await this.driver.open(connectionString);
            console.log('Informix connection successful');
        } catch (error) {
            console.error('Informix connection failed:', error.message);
            
            // 提供更友好的錯誤訊息
            let friendlyMessage = error.message;
            if (error.message.includes('SQL30082N') && error.message.includes('USERNAME AND/OR PASSWORD INVALID')) {
                friendlyMessage = 'Invalid username or password. Please check your credentials.';
            } else if (error.message.includes('SQL30081N') && error.message.includes('communication error')) {
                friendlyMessage = 'Cannot connect to database server. Please check server address, port, and network connectivity.';
            } else if (error.message.includes('Cannot find module')) {
                friendlyMessage = 'IBM DB driver not installed. Please run: npm install ibm_db';
            }
            
            throw new Error(friendlyMessage);
        }
    }
    
    buildInformixConnectionString() {
        // 記錄配置用於調試
        console.log('Informix config:', {
            server: this.config.server,
            port: this.config.port,
            database: this.config.database,
            username: this.config.username,
            protocol: this.config.protocol
        });
        
        // 檢查必要的配置
        if (!this.config.server) {
            throw new Error('Server address is required for Informix connection');
        }
        if (!this.config.database) {
            throw new Error('Database name is required for Informix connection');
        }
        if (!this.config.username) {
            throw new Error('Username is required for Informix connection');
        }
        
        // IBM DB 連接字串格式：DATABASE=db_name;HOSTNAME=host;PORT=port;PROTOCOL=protocol;UID=username;PWD=password;
        const params = {
            DATABASE: this.config.database,
            HOSTNAME: this.config.server,
            PORT: this.config.port || 9088,
            PROTOCOL: (this.config.protocol || 'tcpip').toUpperCase(),
            UID: this.config.username,
            PWD: this.config.password
        };
        
        // 只加入非空的可選參數
        if (this.config.db_locale) {
            params.DB_LOCALE = this.config.db_locale;
        }
        if (this.config.client_locale) {
            params.CLIENT_LOCALE = this.config.client_locale;
        }
        if (this.config.authentication) {
            params.AUTHENTICATION = this.config.authentication.toLowerCase();
        }
        
        const connectionString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join(';') + ';';
            
        console.log(`Informix connection string: ${connectionString}`);
        return connectionString;
    }
    

    
    async disconnect() {
        if (!this.isConnected) return;
        
        try {
            switch (this.dbType) {
                case 'mssql':
                    if (this.pool) await this.pool.close();
                    break;
                case 'postgres':
                    if (this.pool) await this.pool.end();
                    break;
                case 'mysql':
                    if (this.connection) await this.connection.end();
                    break;
                case 'oracle':
                    if (this.pool) await this.pool.close();
                    break;
                case 'informix':
                    if (this.connection) await this.connection.close();
                    break;
            }
            
            this.isConnected = false;
            this.status = 'disconnected';
            this.emit('disconnect');
        } catch (error) {
            this.emit('error', error);
        }
    }
    
    async getTableSchema(tableName) {
        if (!this.isConnected) {
            await this.connect();
        }
        
        console.log(`[DatabaseClient] Getting schema for table: ${tableName}, dbType: ${this.dbType}`);
        
        let query;
        switch (this.dbType) {
            case 'mssql':
                query = `
                    SELECT 
                        COLUMN_NAME as column_name,
                        DATA_TYPE as data_type,
                        CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
                        NUMERIC_PRECISION as numeric_precision,
                        NUMERIC_SCALE as numeric_scale,
                        IS_NULLABLE as is_nullable,
                        COLUMN_DEFAULT as column_default
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = '${tableName}'
                    ORDER BY ORDINAL_POSITION
                `;
                break;
                
            case 'postgres':
                query = `
                    SELECT 
                        column_name,
                        data_type,
                        character_maximum_length,
                        numeric_precision,
                        numeric_scale,
                        is_nullable,
                        column_default
                    FROM information_schema.columns 
                    WHERE table_name = '${tableName.toLowerCase()}'
                    ORDER BY ordinal_position
                `;
                break;
                
            case 'mysql':
                query = `
                    SELECT 
                        COLUMN_NAME as column_name,
                        DATA_TYPE as data_type,
                        CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
                        NUMERIC_PRECISION as numeric_precision,
                        NUMERIC_SCALE as numeric_scale,
                        IS_NULLABLE as is_nullable,
                        COLUMN_DEFAULT as column_default
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = '${tableName}' 
                    AND TABLE_SCHEMA = DATABASE()
                    ORDER BY ORDINAL_POSITION
                `;
                break;
                
            case 'oracle':
                query = `
                    SELECT 
                        COLUMN_NAME as column_name,
                        DATA_TYPE as data_type,
                        CHAR_LENGTH as character_maximum_length,
                        DATA_PRECISION as numeric_precision,
                        DATA_SCALE as numeric_scale,
                        NULLABLE as is_nullable,
                        DATA_DEFAULT as column_default
                    FROM USER_TAB_COLUMNS 
                    WHERE TABLE_NAME = UPPER('${tableName}')
                    ORDER BY COLUMN_ID
                `;
                break;
                
            case 'informix':
                // 使用最基本的 Informix 語法
                query = `SELECT c.colname, c.coltype, c.collength FROM syscolumns c, systables t WHERE c.tabid = t.tabid AND t.tabname = '${tableName}' ORDER BY c.colno`;
                
                // 如果需要完整類型映射，可以嘗試這個查詢（但可能會有語法問題）
                const complexQuery = `
                    SELECT
                        c.colname as column_name,
                        CASE
                            WHEN MOD(c.coltype, 256) = 0 THEN 'CHAR'
                            WHEN MOD(c.coltype, 256) = 1 THEN 'SMALLINT'
                            WHEN MOD(c.coltype, 256) = 2 THEN 'INTEGER'
                            WHEN MOD(c.coltype, 256) = 3 THEN 'FLOAT'
                            WHEN MOD(c.coltype, 256) = 4 THEN 'SMALLFLOAT'
                            WHEN MOD(c.coltype, 256) = 5 THEN 'DECIMAL'
                            WHEN MOD(c.coltype, 256) = 6 THEN 'SERIAL'
                            WHEN MOD(c.coltype, 256) = 7 THEN 'DATE'
                            WHEN MOD(c.coltype, 256) = 8 THEN 'MONEY'
                            WHEN MOD(c.coltype, 256) = 10 THEN 'DATETIME'
                            WHEN MOD(c.coltype, 256) = 11 THEN 'BYTE'
                            WHEN MOD(c.coltype, 256) = 12 THEN 'TEXT'
                            WHEN MOD(c.coltype, 256) = 13 THEN 'VARCHAR'
                            WHEN MOD(c.coltype, 256) = 14 THEN 'INTERVAL'
                            WHEN MOD(c.coltype, 256) = 15 THEN 'NCHAR'
                            WHEN MOD(c.coltype, 256) = 16 THEN 'NVARCHAR'
                            WHEN MOD(c.coltype, 256) = 17 THEN 'INT8'
                            WHEN MOD(c.coltype, 256) = 18 THEN 'SERIAL8'
                            WHEN MOD(c.coltype, 256) = 19 THEN 'SET'
                            WHEN MOD(c.coltype, 256) = 20 THEN 'MULTISET'
                            WHEN MOD(c.coltype, 256) = 21 THEN 'LIST'
                            WHEN MOD(c.coltype, 256) = 22 THEN 'Unnamed ROW'
                            WHEN MOD(c.coltype, 256) = 40 THEN 'LVARCHAR'
                            WHEN MOD(c.coltype, 256) = 41 THEN 'BLOB'
                            WHEN MOD(c.coltype, 256) = 42 THEN 'CLOB'
                            ELSE 'UNKNOWN'
                        END as data_type,
                        c.collength as character_maximum_length,
                        NULL as numeric_precision,
                        NULL as numeric_scale,
                        CASE WHEN c.coltype >= 256 THEN 'YES' ELSE 'NO' END as is_nullable,
                        NULL as column_default
                    FROM syscolumns c
                    JOIN systables t ON c.tabid = t.tabid
                    WHERE t.tabname = '${tableName}'
                    ORDER BY c.colno
                `;
                
                console.log(`[DatabaseClient] Using simplified Informix query first`);
                // 先使用簡化查詢，如果需要可以切換到 complexQuery
                break;
                
            default:
                throw new Error(`Unsupported database type: ${this.dbType}`);
        }
        
        console.log(`[DatabaseClient] Generated query for ${this.dbType}:`);
        console.log(query);
        
        return await this.executeQuery(query);
    }
    
    async executeQuery(query) {
        if (!this.isConnected) {
            await this.connect();
        }
        
        console.log(`[DatabaseClient] Executing query on ${this.dbType}...`);
        
        try {
            switch (this.dbType) {
                case 'mssql':
                    const mssqlResult = await this.pool.request().query(query);
                    return mssqlResult.recordset;
                    
                case 'postgres':
                    const pgClient = await this.pool.connect();
                    try {
                        const pgResult = await pgClient.query(query);
                        return pgResult.rows;
                    } finally {
                        pgClient.release();
                    }
                    
                case 'mysql':
                    const [mysqlRows] = await this.connection.execute(query);
                    return mysqlRows;
                    
                case 'oracle':
                    const oracleConn = await this.pool.getConnection();
                    try {
                        const oracleResult = await oracleConn.execute(query);
                        return oracleResult.rows;
                    } finally {
                        await oracleConn.close();
                    }
                    
                case 'informix':
                    console.log(`[DatabaseClient] Executing Informix query...`);
                    try {
                        const infResult = await this.connection.query(query);
                        console.log(`[DatabaseClient] Informix query executed successfully, rows: ${infResult?.length || 0}`);
                        
                        // 轉換基本查詢結果為標準格式
                        if (infResult && infResult.length > 0 && 'colname' in infResult[0]) {
                            console.log(`[DatabaseClient] Converting Informix basic result to standard format`);
                            return infResult.map(row => ({
                                column_name: row.colname,
                                data_type: this.convertInformixType(row.coltype),
                                character_maximum_length: row.collength,
                                numeric_precision: null,
                                numeric_scale: null,
                                is_nullable: row.coltype >= 256 ? 'YES' : 'NO',
                                column_default: null
                            }));
                        }
                        
                        return infResult;
                    } catch (infError) {
                        console.error(`[DatabaseClient] Informix query failed: ${infError.message}`);
                        // 如果還是失敗，嘗試最簡單的查詢
                        if (infError.message.includes('syntax error')) {
                            console.log(`[DatabaseClient] Trying ultra-simple Informix query...`);
                            const tableName = query.match(/tabname = '([^']+)'/)?.[1] || 'unknown';
                            const fallbackQuery = `SELECT colname, coltype, collength FROM syscolumns WHERE tabid IN (SELECT tabid FROM systables WHERE tabname = '${tableName}')`;
                            console.log(`[DatabaseClient] Fallback query: ${fallbackQuery}`);
                            const fallbackResult = await this.connection.query(fallbackQuery);
                            // 轉換為標準格式
                            return fallbackResult.map(row => ({
                                column_name: row.colname,
                                data_type: this.convertInformixType(row.coltype),
                                character_maximum_length: row.collength,
                                numeric_precision: null,
                                numeric_scale: null,
                                is_nullable: row.coltype >= 256 ? 'YES' : 'NO',
                                column_default: null
                            }));
                        }
                        throw infError;
                    }
                    
                default:
                    throw new Error(`Unsupported database type: ${this.dbType}`);
            }
        } catch (error) {
            console.error(`[DatabaseClient] Query execution failed for ${this.dbType}:`);
            console.error(`Error: ${error.message}`);
            console.error(`Query: ${query}`);
            throw new Error(`Query execution failed: ${error.message}`);
        }
    }
    
    async listTables() {
        let query;
        switch (this.dbType) {
            case 'mssql':
                query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
                break;
            case 'postgres':
                query = "SELECT tablename as table_name FROM pg_tables WHERE schemaname = 'public'";
                break;
            case 'mysql':
                query = "SELECT TABLE_NAME as table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'";
                break;
            case 'oracle':
                query = "SELECT TABLE_NAME as table_name FROM USER_TABLES";
                break;
            case 'informix':
                query = "SELECT tabname as table_name FROM systables WHERE tabtype = 'T'";
                break;
            default:
                throw new Error(`Unsupported database type: ${this.dbType}`);
        }
        
        return await this.executeQuery(query);
    }
    
    // Alias for listTables for backward compatibility
    async getTables() {
        return await this.listTables();
    }
    
    // Convert Informix coltype to readable type name
    convertInformixType(coltype) {
        if (!coltype) return 'UNKNOWN';
        
        const typeCode = coltype % 256;
        switch (typeCode) {
            case 0: return 'CHAR';
            case 1: return 'SMALLINT';
            case 2: return 'INTEGER';
            case 3: return 'FLOAT';
            case 4: return 'SMALLFLOAT';
            case 5: return 'DECIMAL';
            case 6: return 'SERIAL';
            case 7: return 'DATE';
            case 8: return 'MONEY';
            case 10: return 'DATETIME';
            case 11: return 'BYTE';
            case 12: return 'TEXT';
            case 13: return 'VARCHAR';
            case 14: return 'INTERVAL';
            case 15: return 'NCHAR';
            case 16: return 'NVARCHAR';
            case 17: return 'INT8';
            case 18: return 'SERIAL8';
            case 19: return 'SET';
            case 20: return 'MULTISET';
            case 21: return 'LIST';
            case 22: return 'Unnamed ROW';
            case 40: return 'LVARCHAR';
            case 41: return 'BLOB';
            case 42: return 'CLOB';
            case 43: return 'BOOLEAN';
            default: return 'VARCHAR';
        }
    }
}

module.exports = DatabaseClient; 