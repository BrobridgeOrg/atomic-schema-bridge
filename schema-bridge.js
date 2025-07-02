module.exports = function(RED) {
    const DatabaseClient = require('./client');
    const SchemaMapper = require('./schema-mapper');

    // 幫助函數：從連接節點獲取資料庫類型
    function getConnectionDbType(connectionNode) {
        if (!connectionNode) {
            return 'unknown';
        }
        
        // 如果節點有明確的 dbType 屬性（Schema Bridge Connection 類型）
        if (connectionNode.dbType) {
            return connectionNode.dbType;
        }
        
        // 根據節點類型判斷資料庫類型
        switch (connectionNode.type) {
            case 'PostgreSQL Connection':
            case 'postgresql-connection':
                return 'postgres';
            case 'MySQL Connection':
            case 'mysql-connection':
                return 'mysql';
            case 'Oracle Connection':
            case 'oracle-connection':
                return 'oracle';
            case 'MSSQL Connection':
            case 'mssql-connection':
                return 'mssql';
            case 'Informix Connection':
            case 'informix-connection':
                return 'informix';
            case 'Schema Bridge Connection':
                return connectionNode.dbType || 'unknown';
            default:
                // 嘗試從節點名稱推斷
                const nodeTypeLower = (connectionNode.type || '').toLowerCase();
                if (nodeTypeLower.includes('postgres') || nodeTypeLower.includes('postgresql')) {
                    return 'postgres';
                } else if (nodeTypeLower.includes('mysql')) {
                    return 'mysql';
                } else if (nodeTypeLower.includes('oracle')) {
                    return 'oracle';
                } else if (nodeTypeLower.includes('mssql') || nodeTypeLower.includes('sqlserver')) {
                    return 'mssql';
                } else if (nodeTypeLower.includes('informix')) {
                    return 'informix';
                }
                
                console.warn(`Unknown connection node type: ${connectionNode.type}, defaulting to 'unknown'`);
                return 'unknown';
        }
    }

    function SchemaBridgeNode(config) {
        RED.nodes.createNode(this, config);
        
        const node = this;
        const mapper = new SchemaMapper();
        
        // 節點配置
        this.sourceConnection = config.sourceConnection;
        this.targetConnection = config.targetConnection;
        this.sourceTable = config.sourceTable;
        this.targetTable = config.targetTable || config.sourceTable;
        this.generateSql = config.generateSql !== false; // 預設為 true
        this.createTable = config.createTable || false;
        this.customSchema = config.customSchema;
        this.operationMode = config.operationMode || 'connection';
        this.targetDbType = config.targetDbType || 'postgres';
        
        // 初始化狀態和連接檢查
        updateConnectionStatus();
        
        // 部署後延遲檢查連線狀態（確保所有節點都已初始化）
        setTimeout(() => {
            updateConnectionStatus().catch(err => {
                node.warn(`Failed to check connections after deployment: ${err.message}`);
            });
        }, 3000);
        
        // 檢查和更新連接狀態（異步版本）
        async function updateConnectionStatus() {
            // 先顯示檢查中狀態
            node.status({ fill: "blue", shape: "ring", text: "checking connections..." });
            
            try {
                const sourceConnected = await checkConnection(node.sourceConnection);
                
                if (node.operationMode === 'generation') {
                    // SQL Generation Mode - 只檢查 source connection
                    if (!node.sourceConnection) {
                        node.status({ fill: "grey", shape: "ring", text: "no source connection" });
                    } else if (sourceConnected) {
                        node.status({ fill: "green", shape: "ring", text: `source connected | ${node.targetDbType} mode` });
                    } else {
                        node.status({ fill: "red", shape: "ring", text: "source connection failed" });
                    }
                } else {
                    // Database Connection Mode - 檢查兩個 connections
                    const targetConnected = await checkConnection(node.targetConnection);
                    
                    if (!node.sourceConnection && !node.targetConnection) {
                        node.status({ fill: "grey", shape: "ring", text: "no connections" });
                    } else if (sourceConnected && targetConnected) {
                        node.status({ fill: "green", shape: "ring", text: "both connected" });
                    } else if (sourceConnected && !targetConnected) {
                        node.status({ fill: "yellow", shape: "ring", text: "source only" });
                    } else if (!sourceConnected && targetConnected) {
                        node.status({ fill: "yellow", shape: "ring", text: "target only" });
                    } else {
                        node.status({ fill: "red", shape: "ring", text: "connections failed" });
                    }
                }
            } catch (error) {
                node.status({ fill: "red", shape: "ring", text: "connection check failed" });
                node.warn(`Connection check error: ${error.message}`);
            }
        }
        
        // 將函數暴露給節點實例，供 API 端點使用
        node.updateConnectionStatus = updateConnectionStatus;
        
        // 真正測試資料庫連接狀態（異步版本）
        async function checkConnection(connectionId) {
            if (!connectionId) return false;
            
            try {
                const connectionNode = RED.nodes.getNode(connectionId);
                if (!connectionNode) return false;
                
                // 嘗試獲取客戶端並測試連線
                const client = connectionNode.getClient();
                if (!client) return false;
                
                // 根據資料庫類型選擇適當的測試查詢
                let testQuery = 'SELECT 1';
                if (getConnectionDbType(connectionNode) === 'oracle') {
                    testQuery = 'SELECT 1 FROM DUAL';
                }
                
                // 執行測試查詢來驗證連線
                await client.executeQuery(testQuery);
                return true;
                
            } catch (error) {
                // 連線失敗，記錄詳細錯誤（僅用於調試）
                // node.warn(`Connection test failed for ${connectionId}: ${error.message}`);
                return false;
            }
        }
        
        // 監聽連接節點狀態變化
        if (node.sourceConnection) {
            const sourceNode = RED.nodes.getNode(node.sourceConnection);
            if (sourceNode && sourceNode.instance) {
                sourceNode.instance.on('status', () => {
                    updateConnectionStatus().catch(err => {
                        node.warn(`Failed to update connection status: ${err.message}`);
                    });
                });
            }
        }
        
        if (node.targetConnection) {
            const targetNode = RED.nodes.getNode(node.targetConnection);
            if (targetNode && targetNode.instance) {
                targetNode.instance.on('status', () => {
                    updateConnectionStatus().catch(err => {
                        node.warn(`Failed to update connection status: ${err.message}`);
                    });
                });
            }
        }
        
        // 節點關閉時清理
        node.on('close', function() {
            // 清理任何定時器或監聽器
        });
        
        node.on('input', async function(msg) {
            try {
                // 檢查連接
                const sourceConnectionNode = RED.nodes.getNode(node.sourceConnection);
                
                if (!sourceConnectionNode) {
                    node.status({ fill: "red", shape: "ring", text: "source needed" });
                    throw new Error('Source connection required');
                }
                
                if (node.operationMode === 'connection') {
                    // Database Connection Mode
                    const targetConnectionNode = RED.nodes.getNode(node.targetConnection);
                    
                    if (!targetConnectionNode) {
                        node.status({ fill: "red", shape: "ring", text: "target connection needed" });
                        throw new Error('Target connection required in connection mode');
                    }
                    
                    // 如果需要建立表格，確保有目標連接
                    if (node.createTable && !targetConnectionNode) {
                        node.status({ fill: "red", shape: "ring", text: "target needed for table creation" });
                        throw new Error('Target connection required for table creation');
                    }
                } else {
                    // SQL Generation Mode - 不需要 target connection，但 createTable 應該被禁用
                    if (node.createTable) {
                        node.status({ fill: "red", shape: "ring", text: "cannot create table in generation mode" });
                        throw new Error('Table creation not available in SQL generation mode');
                    }
                }
                
                // 執行 Schema 處理
                await handleSchemaProcessing(msg);
                
                // 顯示成功狀態
                if (node.createTable) {
                    node.status({ fill: "green", shape: "dot", text: "table created" });
                } else {
                    const modeText = node.operationMode === 'generation' ? ` (${node.targetDbType})` : '';
                    node.status({ fill: "green", shape: "dot", text: `SQL generated${modeText}` });
                }
                
                // 2秒後回到連接狀態顯示
                setTimeout(() => {
                    updateConnectionStatus().catch(err => {
                        node.warn(`Failed to update connection status: ${err.message}`);
                    });
                }, 2000);
                
            } catch (error) {
                const action = node.createTable ? "create table" : "generate SQL";
                node.status({ fill: "red", shape: "dot", text: `${action} failed` });
                node.error(error.message, msg);
                
                // 5秒後回到連接狀態顯示
                setTimeout(() => {
                    updateConnectionStatus().catch(err => {
                        node.warn(`Failed to update connection status: ${err.message}`);
                    });
                }, 5000);
            }
        });
        
        // 統一的 Schema 處理函數
        async function handleSchemaProcessing(msg) {
            const sourceConnectionNode = RED.nodes.getNode(node.sourceConnection);
            
            const sourceTable = msg.payload?.sourceTable || node.sourceTable;
            const targetTable = msg.payload?.targetTable || node.targetTable || sourceTable;
            
            if (!sourceTable) {
                throw new Error('Source table name not provided');
            }
            
            // 根據操作模式決定目標資料庫類型
            let targetDbType, targetConnectionNode = null;
            if (node.operationMode === 'connection') {
                targetConnectionNode = RED.nodes.getNode(node.targetConnection);
                targetDbType = getConnectionDbType(targetConnectionNode);
            } else {
                targetDbType = node.targetDbType;
            }
            
            // 更新狀態：連接到資料庫
            node.status({ fill: "blue", shape: "dot", text: "connecting..." });
            
            try {
                // 取得 schema
                let schema;
                if (node.customSchema && node.customSchema !== '[]') {
                    // 使用自訂 schema
                    node.status({ fill: "blue", shape: "dot", text: "using custom schema..." });
                    schema = JSON.parse(node.customSchema);
                } else {
                    // 從來源資料庫讀取 schema
                    node.status({ fill: "blue", shape: "dot", text: `reading ${sourceTable}...` });
                    const sourceClient = sourceConnectionNode.getClient();
                    const rawSchema = await sourceClient.getTableSchema(sourceTable);
                    
                    // 轉換 schema 格式
                    schema = rawSchema.map(column => {

                        
                        // 確保data_type欄位存在
                        const dataType = column.data_type || column.DATA_TYPE || 'VARCHAR';
                        if (!dataType || dataType === 'VARCHAR') {
                            console.warn(`[SchemaBridge] Missing data_type for column ${column.column_name || column.COLUMN_NAME}, using default: VARCHAR`);
                        }
                        
                        const convertedType = mapper.convertType(
                            dataType, 
                            getConnectionDbType(sourceConnectionNode), 
                            targetDbType, 
                            column.character_maximum_length || column.CHARACTER_MAXIMUM_LENGTH, 
                            column.numeric_scale || column.NUMERIC_SCALE
                        );
                        
                        return {
                            name: column.column_name || column.COLUMN_NAME,
                            type: convertedType,
                            nullable: (column.is_nullable || column.IS_NULLABLE || column.nullable || column.NULLABLE) === 'YES' || (column.is_nullable || column.IS_NULLABLE || column.nullable || column.NULLABLE) === 'Y',
                            defaultValue: column.column_default || column.COLUMN_DEFAULT || column.data_default || column.DATA_DEFAULT
                        };
                    });
                }
                
                let createTableSQL = null;
                let executionResult = null;
                let executed = false;
                
                // 產生 SQL（如果需要）
                if (node.generateSql) {
                    node.status({ fill: "blue", shape: "dot", text: "generating SQL..." });
                    createTableSQL = generateCreateTableSQL(targetTable, schema, targetDbType);
                }
                
                // 執行建表（如果需要且在 connection mode）
                if (node.createTable && node.operationMode === 'connection') {
                    if (!createTableSQL) {
                        createTableSQL = generateCreateTableSQL(targetTable, schema, targetDbType);
                    }
                    
                    try {
                        node.status({ fill: "blue", shape: "dot", text: `creating ${targetTable}...` });
                        const targetClient = targetConnectionNode.getClient();
                        await targetClient.executeQuery(createTableSQL);
                        executed = true;
                        executionResult = 'Table created successfully';
                    } catch (error) {
                        executionResult = `Failed to create table: ${error.message}`;
                        throw new Error(executionResult);
                    }
                }
                
                // 組成輸出結果
                const result = {
                    sourceTable: sourceTable,
                    targetTable: targetTable,
                    sourceDbType: getConnectionDbType(sourceConnectionNode),
                    targetDbType: targetDbType,
                    operationMode: node.operationMode,
                    schema: schema,
                    actions: {
                        generateSql: node.generateSql,
                        createTable: node.createTable && node.operationMode === 'connection'
                    },
                    processedAt: new Date().toISOString()
                };
                
                // 包含 SQL（如果有產生）
                if (createTableSQL) {
                    result.sql = createTableSQL;
                }
                
                // 包含執行結果（如果有執行）
                if (node.createTable && node.operationMode === 'connection') {
                    result.executed = executed;
                    result.executionResult = executionResult;
                }
                
                msg.payload = result;
                node.send(msg);
                
            } catch (error) {
                throw new Error(`Schema processing failed: ${error.message}`);
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

                
                // 確保data_type欄位存在
                const dataType = column.data_type || column.DATA_TYPE || 'VARCHAR';
                if (!dataType || dataType === 'VARCHAR') {
                    console.warn(`[SchemaBridge API] Missing data_type for column ${column.column_name || column.COLUMN_NAME}, using default: VARCHAR`);
                }
                
                return {
                    name: column.column_name || column.COLUMN_NAME,
                    type: dataType,
                    sourceDbType: getConnectionDbType(connectionNode),
                    nullable: (column.is_nullable || column.IS_NULLABLE || column.nullable || column.NULLABLE) === 'YES' || (column.is_nullable || column.IS_NULLABLE || column.nullable || column.NULLABLE) === 'Y',
                    defaultValue: column.column_default || column.COLUMN_DEFAULT || column.data_default || column.DATA_DEFAULT,
                    length: column.character_maximum_length || column.CHARACTER_MAXIMUM_LENGTH,
                    precision: column.numeric_precision || column.NUMERIC_PRECISION,
                    scale: column.numeric_scale || column.NUMERIC_SCALE
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
    
    RED.httpAdmin.get('/schema-bridge/supported-types/:dbType', function(req, res) {
        try {
            const dbType = req.params.dbType;
            const mapper = new SchemaMapper();
            const supportedTypes = mapper.getSupportedTypesForDatabase(dbType);
            res.json(supportedTypes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    RED.httpAdmin.post('/schema-bridge/convert-type', function(req, res) {
        try {
            const { sourceType, sourceDbType, targetDbType, precision, scale } = req.body;
            const mapper = new SchemaMapper();
            const targetType = mapper.convertType(sourceType, sourceDbType, targetDbType, precision, scale);
            res.json({ targetType });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // 觸發特定節點的連線狀態檢查
    RED.httpAdmin.post('/schema-bridge/check-connections', async function(req, res) {
        try {
            const { nodeId } = req.body;
            
            if (!nodeId) {
                return res.status(400).json({ error: 'Node ID is required' });
            }
            
            const node = RED.nodes.getNode(nodeId);
            
            if (!node) {
                return res.status(404).json({ error: 'Node not found' });
            }
            
            // 檢查是否為 schema-bridge 節點
            if (node.type !== 'schema-bridge') {
                return res.status(400).json({ error: 'Invalid node type' });
            }
            
            // 觸發連線狀態更新（異步執行，不等待結果）
            if (typeof node.updateConnectionStatus === 'function') {
                node.updateConnectionStatus().catch(err => {
                    RED.log.warn(`Failed to update connection status for node ${nodeId}: ${err.message}`);
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Connection status check triggered',
                nodeId: nodeId
            });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    RED.nodes.registerType('schema-bridge', SchemaBridgeNode);
}; 