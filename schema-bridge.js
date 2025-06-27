module.exports = function(RED) {
    const DatabaseClient = require('./client');
    const SchemaMapper = require('./schema-mapper');

    function SchemaBridgeNode(config) {
        RED.nodes.createNode(this, config);
        
        const node = this;
        const mapper = new SchemaMapper();
        
        // 節點配置
        this.sourceConnection = config.sourceConnection;
        this.targetConnection = config.targetConnection;
        this.sourceTable = config.sourceTable;
        this.targetTable = config.targetTable || config.sourceTable;
        this.operation = config.operation || 'analyze';
        this.generateSql = config.generateSql || false;
        this.executeSQL = config.executeSQL || false;
        this.customSchema = config.customSchema;
        
        // 初始化狀態
        this.status({ fill: "grey", shape: "ring", text: "ready" });
        
        node.on('input', async function(msg) {
            try {
                node.status({ fill: "blue", shape: "dot", text: "processing" });
                
                switch (node.operation) {
                    case 'analyze':
                        await handleAnalyze(msg);
                        break;
                    case 'convert':
                        await handleConvert(msg);
                        break;
                    case 'migrate':
                        await handleMigrate(msg);
                        break;
                    default:
                        throw new Error(`Unknown operation: ${node.operation}`);
                }
                
                node.status({ fill: "green", shape: "dot", text: "success" });
            } catch (error) {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error(error.message, msg);
            }
        });
        
        // 分析來源表 schema
        async function handleAnalyze(msg) {
            const sourceConnectionNode = RED.nodes.getNode(node.sourceConnection);
            if (!sourceConnectionNode) {
                throw new Error('Source connection not found');
            }
            
            const tableName = msg.payload?.tableName || node.sourceTable;
            if (!tableName) {
                throw new Error('Table name not provided');
            }
            
            try {
                // 使用連接節點獲取 schema
                const sourceClient = sourceConnectionNode.getClient();
                const schema = await sourceClient.getTableSchema(tableName);
                
                // 轉換為標準化格式
                const normalizedSchema = schema.map(column => {
                    const standardType = mapper.normalizeType(column.data_type, sourceConnectionNode.dbType);
                    
                    return {
                        originalName: column.column_name,
                        name: column.column_name,
                        originalType: column.data_type,
                        standardType: standardType,
                        mappedType: node.targetConnection ? 
                            mapper.convertToTarget(standardType, RED.nodes.getNode(node.targetConnection)?.dbType, column.character_maximum_length, column.numeric_scale) : 
                            standardType,
                        length: column.character_maximum_length,
                        precision: column.numeric_precision,
                        scale: column.numeric_scale,
                        nullable: column.is_nullable === 'YES',
                        defaultValue: column.column_default,
                        isCustom: false
                    };
                });
                
                const result = {
                    operation: 'analyze',
                    sourceTable: tableName,
                    sourceDbType: sourceConnectionNode.dbType,
                    targetDbType: node.targetConnection ? RED.nodes.getNode(node.targetConnection)?.dbType : null,
                    schema: normalizedSchema,
                    metadata: {
                        totalColumns: normalizedSchema.length,
                        analyzedAt: new Date().toISOString()
                    }
                };
                
                // 如果需要生成 SQL
                if (node.generateSql && node.targetConnection) {
                    const targetDbType = RED.nodes.getNode(node.targetConnection).dbType;
                    result.sql = generateCreateTableSQL(
                        node.targetTable || tableName,
                        normalizedSchema,
                        targetDbType
                    );
                }
                
                msg.payload = result;
                node.send(msg);
                
            } catch (error) {
                throw new Error(`Failed to analyze schema: ${error.message}`);
            }
        }
        
        // 轉換 schema
        async function handleConvert(msg) {
            const sourceConnectionNode = RED.nodes.getNode(node.sourceConnection);
            const targetConnectionNode = RED.nodes.getNode(node.targetConnection);
            
            if (!sourceConnectionNode) {
                throw new Error('Source connection not found');
            }
            
            if (!targetConnectionNode) {
                throw new Error('Target connection not found');
            }
            
            let schema;
            
            // 如果有自訂 schema，使用自訂的
            if (node.customSchema && node.customSchema !== '[]') {
                try {
                    schema = JSON.parse(node.customSchema);
                } catch (e) {
                    throw new Error('Invalid custom schema format');
                }
            } else {
                // 否則從資料庫取得 schema
                const tableName = msg.payload?.tableName || node.sourceTable;
                if (!tableName) {
                    throw new Error('Table name not provided');
                }
                
                const sourceClient = sourceConnectionNode.getClient();
                const rawSchema = await sourceClient.getTableSchema(tableName);
                
                schema = rawSchema.map(column => {
                    const standardType = mapper.normalizeType(column.data_type, sourceConnectionNode.dbType);
                    
                    return {
                        name: column.column_name,
                        type: mapper.convertToTarget(
                            standardType, 
                            targetConnectionNode.dbType, 
                            column.character_maximum_length, 
                            column.numeric_scale
                        ),
                        nullable: column.is_nullable === 'YES',
                        defaultValue: column.column_default
                    };
                });
            }
            
            // 生成 CREATE TABLE SQL
            const createTableSQL = generateCreateTableSQL(
                node.targetTable || node.sourceTable,
                schema,
                targetConnectionNode.dbType
            );
            
            const result = {
                operation: 'convert',
                sourceTable: node.sourceTable,
                targetTable: node.targetTable || node.sourceTable,
                sourceDbType: sourceConnectionNode.dbType,
                targetDbType: targetConnectionNode.dbType,
                schema: schema,
                sql: createTableSQL,
                convertedAt: new Date().toISOString()
            };
            
            msg.payload = result;
            node.send(msg);
        }
        
        // 執行建表操作
        async function handleMigrate(msg) {
            const sourceConnectionNode = RED.nodes.getNode(node.sourceConnection);
            const targetConnectionNode = RED.nodes.getNode(node.targetConnection);
            
            if (!sourceConnectionNode) {
                throw new Error('Source connection not found');
            }
            
            if (!targetConnectionNode) {
                throw new Error('Target connection not found');
            }
            
            const sourceTable = msg.payload?.sourceTable || node.sourceTable;
            const targetTable = msg.payload?.targetTable || node.targetTable || sourceTable;
            
            if (!sourceTable) {
                throw new Error('Source table name not provided');
            }
            
            try {
                const sourceClient = sourceConnectionNode.getClient();
                const targetClient = targetConnectionNode.getClient();
                
                // 先轉換 schema
                let schema;
                if (node.customSchema && node.customSchema !== '[]') {
                    schema = JSON.parse(node.customSchema);
                } else {
                    const rawSchema = await sourceClient.getTableSchema(sourceTable);
                    schema = rawSchema.map(column => {
                        const standardType = mapper.normalizeType(column.data_type, sourceConnectionNode.dbType);
                        return {
                            name: column.column_name,
                            type: mapper.convertToTarget(
                                standardType, 
                                targetConnectionNode.dbType, 
                                column.character_maximum_length, 
                                column.numeric_scale
                            ),
                            nullable: column.is_nullable === 'YES',
                            defaultValue: column.column_default
                        };
                    });
                }
                
                // 生成建表 SQL
                const createTableSQL = generateCreateTableSQL(targetTable, schema, targetConnectionNode.dbType);
                
                let executionResult = null;
                let executed = false;
                
                // 如果配置為執行 SQL，則執行建表語句
                if (node.executeSQL) {
                    try {
                        await targetClient.executeQuery(createTableSQL);
                        executed = true;
                        executionResult = 'Table created successfully';
                    } catch (error) {
                        executionResult = `Failed to create table: ${error.message}`;
                    }
                }
                
                const result = {
                    operation: 'migrate',
                    sourceTable: sourceTable,
                    targetTable: targetTable,
                    sourceDbType: sourceConnectionNode.dbType,
                    targetDbType: targetConnectionNode.dbType,
                    schema: schema,
                    sql: createTableSQL,
                    executed: executed,
                    executionResult: executionResult,
                    success: true,
                    createdAt: new Date().toISOString()
                };
                
                msg.payload = result;
                node.send(msg);
                
            } catch (error) {
                throw new Error(`Create table operation failed: ${error.message}`);
            }
        }
        
        // 生成建表 SQL
        function generateCreateTableSQL(tableName, schema, dbType) {
            let sql = `CREATE TABLE ${tableName} (\n`;
            
            const columnDefs = schema.map(column => {
                let def = `    ${column.name} ${column.type}`;
                if (!column.nullable) def += ' NOT NULL';
                if (column.defaultValue) {
                    // 處理不同類型的預設值
                    if (typeof column.defaultValue === 'string' && !column.defaultValue.startsWith('(')) {
                        def += ` DEFAULT '${column.defaultValue}'`;
                    } else {
                        def += ` DEFAULT ${column.defaultValue}`;
                    }
                }
                return def;
            });
            
            sql += columnDefs.join(',\n');
            sql += '\n);';
            
            return sql;
        }
    }

    // API 端點
    
    RED.httpAdmin.post('/schema-bridge/connection-schema', async function(req, res) {
        try {
            const { connectionId, tableName } = req.body;
            const connectionNode = RED.nodes.getNode(connectionId);
            
            if (!connectionNode) {
                return res.status(404).json({ error: 'Connection not found' });
            }
            
            const client = connectionNode.getClient();
            const schema = await client.getTableSchema(tableName);
            const mapper = new SchemaMapper();
            
            // 轉換為編輯器格式
            const editorSchema = schema.map(column => {
                const standardType = mapper.normalizeType(column.data_type, connectionNode.dbType);
                
                return {
                    name: column.column_name,
                    type: column.data_type,
                    mappedType: standardType,
                    nullable: column.is_nullable === 'YES',
                    defaultValue: column.column_default,
                    length: column.character_maximum_length,
                    precision: column.numeric_precision,
                    scale: column.numeric_scale
                };
            });
            
            res.json(editorSchema);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    RED.httpAdmin.post('/schema-bridge/test-connection', async function(req, res) {
        try {
            const { dbType, config } = req.body;
            const client = new DatabaseClient(dbType, { connection: config });
            
            await client.connect();
            const tables = await client.getTables();
            await client.disconnect();
            
            res.json({ 
                success: true, 
                tableCount: tables.length,
                message: 'Connection successful'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    RED.nodes.registerType('schema-bridge', SchemaBridgeNode);
}; 