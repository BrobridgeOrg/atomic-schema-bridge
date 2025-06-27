class SchemaMapper {
    constructor() {
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
    
    // 將來源資料庫型別轉換為標準化型別
    normalizeType(sourceType, sourceDbType) {
        const mapping = this.typeMapping[sourceDbType.toLowerCase()];
        if (!mapping) {
            throw new Error(`Unsupported source database type: ${sourceDbType}`);
        }
        
        const normalizedType = mapping[sourceType.toUpperCase()];
        return normalizedType || sourceType;
    }
    
    // 將標準化型別轉換為目標資料庫型別
    convertToTarget(standardType, targetDbType, precision = null, scale = null) {
        const mapping = this.standardToTarget[targetDbType.toLowerCase()];
        if (!mapping) {
            throw new Error(`Unsupported target database type: ${targetDbType}`);
        }
        
        let targetType = mapping[standardType.toUpperCase()];
        if (!targetType) {
            targetType = standardType; // 使用原始型別作為備選
        }
        
        // 為需要精度和標度的型別添加參數
        if (precision && (standardType === 'DECIMAL' || standardType === 'NUMERIC')) {
            if (scale) {
                targetType += `(${precision},${scale})`;
            } else {
                targetType += `(${precision})`;
            }
        } else if (precision && (standardType === 'VARCHAR' || standardType === 'CHAR')) {
            targetType += `(${precision})`;
        }
        
        return targetType;
    }
    
    // 完整的型別轉換流程
    convertType(sourceType, sourceDbType, targetDbType, precision = null, scale = null) {
        const standardType = this.normalizeType(sourceType, sourceDbType);
        return this.convertToTarget(standardType, targetDbType, precision, scale);
    }
    
    // 獲取支援的資料庫類型列表
    getSupportedDatabases() {
        return ['informix', 'postgres', 'mssql', 'oracle', 'mysql'];
    }
}

module.exports = SchemaMapper; 