class SchemaMapper {
    constructor() {
        // 定義各資料庫支援的原生類型
        this.supportedTypes = {
            informix: [
                'INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL',
                'DECIMAL', 'MONEY', 'SMALLFLOAT', 'FLOAT',
                'CHAR', 'VARCHAR', 'LVARCHAR', 'TEXT',
                'DATE', 'DATETIME', 'INTERVAL',
                'BOOLEAN', 'BYTE'
            ],
            postgres: [
                'INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL',
                'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE PRECISION',
                'CHARACTER', 'CHARACTER VARYING', 'VARCHAR', 'TEXT',
                'DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ',
                'BOOLEAN', 'BYTEA'
            ],
            mssql: [
                'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
                'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL',
                'CHAR', 'NCHAR', 'VARCHAR', 'NVARCHAR', 'TEXT', 'NTEXT',
                'DATE', 'TIME', 'DATETIME', 'DATETIME2', 'SMALLDATETIME',
                'BIT', 'BINARY', 'VARBINARY', 'IMAGE'
            ],
            oracle: [
                'NUMBER', 'INTEGER', 'FLOAT', 'BINARY_FLOAT', 'BINARY_DOUBLE',
                'CHAR', 'NCHAR', 'VARCHAR2', 'NVARCHAR2', 'CLOB', 'NCLOB', 'LONG',
                'DATE', 'TIMESTAMP',
                'BLOB', 'LONG RAW', 'RAW'
            ],
            mysql: [
                'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'MEDIUMINT',
                'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
                'CHAR', 'VARCHAR', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT', 'TINYTEXT',
                'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
                'BOOLEAN', 'BOOL', 'BINARY', 'VARBINARY', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB', 'TINYBLOB'
            ]
        };

        // 定義語義分類（用於智能映射）
        this.typeCategories = {
            // 整數類型
            integer_small: ['SMALLINT', 'TINYINT'],
            integer_normal: ['INTEGER', 'INT', 'MEDIUMINT'],
            integer_big: ['BIGINT'],
            integer_auto: ['SERIAL', 'BIGSERIAL'],
            
            // 浮點數類型
            float_small: ['REAL', 'SMALLFLOAT', 'BINARY_FLOAT'],
            float_normal: ['FLOAT'],
            float_big: ['DOUBLE', 'DOUBLE PRECISION', 'BINARY_DOUBLE'],
            
            // 精確數值類型
            decimal: ['DECIMAL', 'NUMERIC', 'NUMBER', 'MONEY'],
            
            // 字元類型
            char_fixed: ['CHAR', 'NCHAR'],
            char_variable: ['VARCHAR', 'NVARCHAR', 'VARCHAR2', 'NVARCHAR2', 'CHARACTER VARYING', 'LVARCHAR'],
            char_large: ['TEXT', 'NTEXT', 'CLOB', 'NCLOB', 'LONG', 'MEDIUMTEXT', 'LONGTEXT'],
            char_small: ['TINYTEXT'],
            
            // 日期時間類型
            date_only: ['DATE'],
            time_only: ['TIME'],
            datetime: ['DATETIME', 'DATETIME2', 'SMALLDATETIME'],
            timestamp: ['TIMESTAMP', 'TIMESTAMPTZ'],
            time_interval: ['INTERVAL'],
            year_only: ['YEAR'],
            
            // 布林類型
            boolean: ['BOOLEAN', 'BOOL', 'BIT'],
            
            // 二進位類型
            binary_small: ['BINARY', 'RAW'],
            binary_variable: ['VARBINARY', 'LONG RAW'],
            binary_large: ['BLOB', 'BYTE', 'BYTEA', 'IMAGE', 'MEDIUMBLOB', 'LONGBLOB', 'TINYBLOB']
        };

        // 定義各資料庫的基本型別映射
        this.typeMapping = {
            // 標準化型別
            standard: {
                'INTEGER': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'NUMERIC',
                'FLOAT': 'FLOAT',
                'REAL': 'REAL',
                'DOUBLE': 'DOUBLE',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'TIMESTAMP': 'TIMESTAMP',
                'DATETIME': 'DATETIME',
                'BOOLEAN': 'BOOLEAN',
                'BLOB': 'BLOB'
            },
            
            // 各資料庫特定型別對應標準化型別
            informix: {
                'INTEGER': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'MONEY': 'DECIMAL',
                'SMALLFLOAT': 'REAL',
                'FLOAT': 'DOUBLE',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'LVARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'BYTE': 'BLOB',
                'DATE': 'DATE',
                'DATETIME': 'TIMESTAMP',
                'INTERVAL': 'VARCHAR',
                'BOOLEAN': 'BOOLEAN',
                'SERIAL': 'INTEGER',
                'BIGSERIAL': 'BIGINT'
            },
            
            postgres: {
                'INTEGER': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'NUMERIC',
                'REAL': 'REAL',
                'DOUBLE PRECISION': 'DOUBLE',
                'CHARACTER': 'CHAR',
                'CHARACTER VARYING': 'VARCHAR',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'TIMESTAMP': 'TIMESTAMP',
                'TIMESTAMPTZ': 'TIMESTAMP',
                'BOOLEAN': 'BOOLEAN',
                'BYTEA': 'BLOB',
                'SERIAL': 'INTEGER',
                'BIGSERIAL': 'BIGINT'
            },
            
            mssql: {
                'INT': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'TINYINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'NUMERIC',
                'FLOAT': 'DOUBLE',
                'REAL': 'REAL',
                'CHAR': 'CHAR',
                'NCHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'NVARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'NTEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'DATETIME': 'DATETIME',
                'DATETIME2': 'TIMESTAMP',
                'SMALLDATETIME': 'DATETIME',
                'TIMESTAMP': 'TIMESTAMP',
                'BIT': 'BOOLEAN',
                'BINARY': 'BLOB',
                'VARBINARY': 'BLOB',
                'IMAGE': 'BLOB'
            },
            
            oracle: {
                'NUMBER': 'NUMERIC',
                'INTEGER': 'INTEGER',
                'FLOAT': 'DOUBLE',
                'BINARY_FLOAT': 'REAL',
                'BINARY_DOUBLE': 'DOUBLE',
                'CHAR': 'CHAR',
                'NCHAR': 'CHAR',
                'VARCHAR2': 'VARCHAR',
                'NVARCHAR2': 'VARCHAR',
                'LONG': 'TEXT',
                'CLOB': 'TEXT',
                'NCLOB': 'TEXT',
                'DATE': 'DATETIME',
                'TIMESTAMP': 'TIMESTAMP',
                'BLOB': 'BLOB',
                'LONG RAW': 'BLOB',
                'RAW': 'BLOB'
            },
            
            mysql: {
                'INT': 'INTEGER',
                'INTEGER': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'TINYINT': 'SMALLINT',
                'MEDIUMINT': 'INTEGER',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'NUMERIC',
                'FLOAT': 'FLOAT',
                'DOUBLE': 'DOUBLE',
                'REAL': 'REAL',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'MEDIUMTEXT': 'TEXT',
                'LONGTEXT': 'TEXT',
                'TINYTEXT': 'VARCHAR',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'DATETIME': 'DATETIME',
                'TIMESTAMP': 'TIMESTAMP',
                'YEAR': 'SMALLINT',
                'BOOLEAN': 'BOOLEAN',
                'BOOL': 'BOOLEAN',
                'BINARY': 'BLOB',
                'VARBINARY': 'BLOB',
                'BLOB': 'BLOB',
                'MEDIUMBLOB': 'BLOB',
                'LONGBLOB': 'BLOB',
                'TINYBLOB': 'BLOB'
            }
        };
        
        // 從標準化型別轉換到目標資料庫型別
        this.standardToTarget = {
            informix: {
                'INTEGER': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'DECIMAL',
                'FLOAT': 'SMALLFLOAT',
                'REAL': 'SMALLFLOAT',
                'DOUBLE': 'FLOAT',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'DATETIME HOUR TO SECOND',
                'TIMESTAMP': 'DATETIME YEAR TO FRACTION(5)',
                'DATETIME': 'DATETIME YEAR TO SECOND',
                'BOOLEAN': 'BOOLEAN',
                'BLOB': 'BYTE'
            },
            
            postgres: {
                'INTEGER': 'INTEGER',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'NUMERIC',
                'FLOAT': 'REAL',
                'REAL': 'REAL',
                'DOUBLE': 'DOUBLE PRECISION',
                'CHAR': 'CHARACTER',
                'VARCHAR': 'CHARACTER VARYING',
                'TEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'TIMESTAMP': 'TIMESTAMP',
                'DATETIME': 'TIMESTAMP',
                'BOOLEAN': 'BOOLEAN',
                'BLOB': 'BYTEA'
            },
            
            mssql: {
                'INTEGER': 'INT',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'NUMERIC',
                'FLOAT': 'FLOAT',
                'REAL': 'REAL',
                'DOUBLE': 'FLOAT',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'TIMESTAMP': 'DATETIME2',
                'DATETIME': 'DATETIME',
                'BOOLEAN': 'BIT',
                'BLOB': 'VARBINARY(MAX)'
            },
            
            oracle: {
                'INTEGER': 'NUMBER(10)',
                'BIGINT': 'NUMBER(19)',
                'SMALLINT': 'NUMBER(5)',
                'DECIMAL': 'NUMBER',
                'NUMERIC': 'NUMBER',
                'FLOAT': 'BINARY_FLOAT',
                'REAL': 'BINARY_FLOAT',
                'DOUBLE': 'BINARY_DOUBLE',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR2',
                'TEXT': 'CLOB',
                'DATE': 'DATE',
                'TIME': 'TIMESTAMP',
                'TIMESTAMP': 'TIMESTAMP',
                'DATETIME': 'DATE',
                'BOOLEAN': 'NUMBER(1)',
                'BLOB': 'BLOB'
            },
            
            mysql: {
                'INTEGER': 'INT',
                'BIGINT': 'BIGINT',
                'SMALLINT': 'SMALLINT',
                'DECIMAL': 'DECIMAL',
                'NUMERIC': 'DECIMAL',
                'FLOAT': 'FLOAT',
                'REAL': 'DOUBLE',
                'DOUBLE': 'DOUBLE',
                'CHAR': 'CHAR',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DATE': 'DATE',
                'TIME': 'TIME',
                'TIMESTAMP': 'TIMESTAMP',
                'DATETIME': 'DATETIME',
                'BOOLEAN': 'BOOLEAN',
                'BLOB': 'BLOB'
            }
        };
    }
    
    // 精確匹配類型所屬的語義分類
    findTypeCategory(type) {
        const upperType = type.toUpperCase();
        
        // 精確匹配優先
        for (const [category, types] of Object.entries(this.typeCategories)) {
            if (types.includes(upperType)) {
                return category;
            }
        }
        
        // 安全的部分匹配 - 只匹配明確的前綴，避免錯誤匹配
        for (const [category, types] of Object.entries(this.typeCategories)) {
            for (const catType of types) {
                // 只有當類型名稱是以分類類型開頭且後面跟著 '(' 或空格時才匹配
                if (upperType.startsWith(catType + '(') || 
                    upperType.startsWith(catType + ' ')) {
                    return category;
                }
            }
        }
        
        return null;
    }
    
    // 智能類型轉換
    convertType(sourceType, sourceDbType, targetDbType, precision = null, scale = null) {
        if (!sourceType || !sourceDbType || !targetDbType) {
            throw new Error(`All parameters are required. Got sourceType: ${sourceType}, sourceDbType: ${sourceDbType}, targetDbType: ${targetDbType}`);
        }
        
        const sourceDb = sourceDbType.toLowerCase();
        const targetDb = targetDbType.toLowerCase();
        const upperSourceType = sourceType.toUpperCase();
        
        // 1. 如果是相同資料庫類型，完全保持原類型不變
        if (sourceDb === targetDb) {
            return sourceType;
        }
        
        // 2. 優先使用傳統映射（最可靠的方法）
        const sourceMapping = this.typeMapping[sourceDb];
        const targetMapping = this.standardToTarget[targetDb];
        
        if (sourceMapping && targetMapping) {
            const standardType = sourceMapping[upperSourceType];
            if (standardType && targetMapping[standardType]) {
                const targetType = targetMapping[standardType];
                return this.addPrecisionScale(targetType, precision, scale);
            }
        }
        
        // 3. 檢查目標資料庫是否直接支援源類型的精確匹配
        const targetSupportedTypes = this.supportedTypes[targetDb];
        if (targetSupportedTypes) {
            // 精確匹配
            if (targetSupportedTypes.includes(upperSourceType)) {
                return this.addPrecisionScale(sourceType, precision, scale);
            }
            
            // 檢查是否有相似的基本類型
            const baseSourceType = upperSourceType.split('(')[0]; // 去掉參數部分
            if (targetSupportedTypes.includes(baseSourceType)) {
                return this.addPrecisionScale(baseSourceType, precision, scale);
            }
        }
        
        // 4. 通過語義分類找到最佳匹配
        const sourceCategory = this.findTypeCategory(sourceType);
        if (sourceCategory && targetSupportedTypes) {
            const fallbackType = this.getFallbackType(sourceCategory, targetDb);
            if (fallbackType) {
                return this.addPrecisionScale(fallbackType, precision, scale);
            }
        }
        
        // 5. 終極備選：使用最安全的文字類型
        return this.getSafeTextType(targetDb);
    }
    
    // 為類型添加精度和標度
    addPrecisionScale(type, precision, scale) {
        if (!precision) return type;
        
        const upperType = type.toUpperCase();
        if (upperType.includes('DECIMAL') || upperType.includes('NUMERIC') || upperType === 'NUMBER') {
            if (scale) {
                return `${type}(${precision},${scale})`;
            } else {
                return `${type}(${precision})`;
            }
        } else if (upperType.includes('VARCHAR') || upperType.includes('CHAR')) {
            return `${type}(${precision})`;
        }
        
        return type;
    }
    
    // 根據語義分類獲取備選類型
    getFallbackType(category, targetDb) {
        const fallbackMap = {
            integer_small: { 
                informix: 'SMALLINT', postgres: 'SMALLINT', mssql: 'SMALLINT', 
                oracle: 'NUMBER(5)', mysql: 'SMALLINT' 
            },
            integer_normal: { 
                informix: 'INTEGER', postgres: 'INTEGER', mssql: 'INT', 
                oracle: 'NUMBER(10)', mysql: 'INT' 
            },
            integer_big: { 
                informix: 'BIGINT', postgres: 'BIGINT', mssql: 'BIGINT', 
                oracle: 'NUMBER(19)', mysql: 'BIGINT' 
            },
            integer_auto: { 
                informix: 'SERIAL', postgres: 'SERIAL', mssql: 'INT IDENTITY', 
                oracle: 'NUMBER GENERATED BY DEFAULT AS IDENTITY', mysql: 'INT AUTO_INCREMENT' 
            },
            float_small: { 
                informix: 'SMALLFLOAT', postgres: 'REAL', mssql: 'REAL', 
                oracle: 'BINARY_FLOAT', mysql: 'FLOAT' 
            },
            float_normal: { 
                informix: 'FLOAT', postgres: 'REAL', mssql: 'FLOAT', 
                oracle: 'BINARY_FLOAT', mysql: 'FLOAT' 
            },
            float_big: { 
                informix: 'FLOAT', postgres: 'DOUBLE PRECISION', mssql: 'FLOAT', 
                oracle: 'BINARY_DOUBLE', mysql: 'DOUBLE' 
            },
            decimal: { 
                informix: 'DECIMAL', postgres: 'DECIMAL', mssql: 'DECIMAL', 
                oracle: 'NUMBER', mysql: 'DECIMAL' 
            },
            char_fixed: { 
                informix: 'CHAR', postgres: 'CHARACTER', mssql: 'CHAR', 
                oracle: 'CHAR', mysql: 'CHAR' 
            },
            char_variable: { 
                informix: 'VARCHAR', postgres: 'VARCHAR', mssql: 'VARCHAR', 
                oracle: 'VARCHAR2', mysql: 'VARCHAR' 
            },
            char_large: { 
                informix: 'TEXT', postgres: 'TEXT', mssql: 'TEXT', 
                oracle: 'CLOB', mysql: 'TEXT' 
            },
            char_small: { 
                informix: 'VARCHAR', postgres: 'VARCHAR', mssql: 'VARCHAR', 
                oracle: 'VARCHAR2', mysql: 'VARCHAR' 
            },
            date_only: { 
                informix: 'DATE', postgres: 'DATE', mssql: 'DATE', 
                oracle: 'DATE', mysql: 'DATE' 
            },
            time_only: { 
                informix: 'DATETIME HOUR TO SECOND', postgres: 'TIME', mssql: 'TIME', 
                oracle: 'TIMESTAMP', mysql: 'TIME' 
            },
            datetime: { 
                informix: 'DATETIME YEAR TO SECOND', postgres: 'TIMESTAMP', mssql: 'DATETIME', 
                oracle: 'DATE', mysql: 'DATETIME' 
            },
            timestamp: { 
                informix: 'DATETIME YEAR TO FRACTION(5)', postgres: 'TIMESTAMP', mssql: 'DATETIME2', 
                oracle: 'TIMESTAMP', mysql: 'TIMESTAMP' 
            },
            time_interval: { 
                informix: 'INTERVAL', postgres: 'INTERVAL', mssql: 'VARCHAR', 
                oracle: 'INTERVAL DAY TO SECOND', mysql: 'VARCHAR' 
            },
            year_only: { 
                informix: 'SMALLINT', postgres: 'SMALLINT', mssql: 'SMALLINT', 
                oracle: 'NUMBER(4)', mysql: 'YEAR' 
            },
            boolean: { 
                informix: 'BOOLEAN', postgres: 'BOOLEAN', mssql: 'BIT', 
                oracle: 'NUMBER(1)', mysql: 'BOOLEAN' 
            },
            binary_small: { 
                informix: 'BYTE', postgres: 'BYTEA', mssql: 'BINARY', 
                oracle: 'RAW', mysql: 'BINARY' 
            },
            binary_variable: { 
                informix: 'BYTE', postgres: 'BYTEA', mssql: 'VARBINARY', 
                oracle: 'RAW', mysql: 'VARBINARY' 
            },
            binary_large: { 
                informix: 'BYTE', postgres: 'BYTEA', mssql: 'VARBINARY(MAX)', 
                oracle: 'BLOB', mysql: 'BLOB' 
            }
        };
        
        return fallbackMap[category] && fallbackMap[category][targetDb];
    }
    
    // 獲取安全的文字類型
    getSafeTextType(targetDb) {
        const safeTypes = {
            informix: 'TEXT',
            postgres: 'TEXT', 
            mssql: 'TEXT',
            oracle: 'CLOB',
            mysql: 'TEXT'
        };
        return safeTypes[targetDb] || 'TEXT';
    }
    
    // 獲取目標資料庫支援的類型列表（供UI使用）
    getSupportedTypesForDatabase(dbType) {
        const baseTypes = this.supportedTypes[dbType.toLowerCase()] || [];
        
        // 添加常用的有參數的類型
        const typesWithParams = [];
        baseTypes.forEach(type => {
            typesWithParams.push(type);
            
            // 為字串類型添加常用長度
            if (type.includes('VARCHAR') || type.includes('CHAR')) {
                typesWithParams.push(`${type}(50)`, `${type}(100)`, `${type}(255)`, `${type}(500)`);
            }
            
            // 為數值類型添加常用精度
            if (type.includes('DECIMAL') || type.includes('NUMERIC') || type === 'NUMBER') {
                typesWithParams.push(`${type}(10,2)`, `${type}(15,4)`, `${type}(18,6)`);
            }
        });
        
        return [...new Set(typesWithParams)].sort();
    }
    
    // 獲取支援的資料庫類型列表
    getSupportedDatabases() {
        return ['informix', 'postgres', 'mssql', 'oracle', 'mysql'];
    }
}

module.exports = SchemaMapper; 