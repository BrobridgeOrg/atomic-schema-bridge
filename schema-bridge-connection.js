module.exports = function (RED) {
    const events = require('events');

    function SchemaBridgeConnectionNode(n) {
        RED.nodes.createNode(this, n);

        let node = this;
        this.instance = new events.EventEmitter();
        this.client = null;
        this.dependencies = 0;
        this.status = 'disconnected';
        this.dbType = n.dbType || 'mssql';

        // 取得預設端口
        this.getDefaultPort = function(dbType) {
            const defaultPorts = {
                'mssql': 1433,
                'postgres': 5432,
                'mysql': 3306,
                'oracle': 1521,
                'informix': 9088
            };
            return defaultPorts[dbType] || 1433;
        };

        // 通用配置
        this.connConfig = {
            server: n.server,
            port: n.port ? Number(n.port) : this.getDefaultPort(this.dbType),
            database: n.database,
            username: this.credentials.username,
            password: this.credentials.password,
            connectionTimeout: n.connectionTimeout ? Number(n.connectionTimeout) : 15000,
            requestTimeout: n.requestTimeout ? Number(n.requestTimeout) : 15000,
            connectionRetryInterval: n.connectionRetryInterval ? Number(n.connectionRetryInterval) : 3000
        };

        // 驗證必要的配置
        if (!this.connConfig.server) {
            node.error('Server address is required but not provided');
            this.connConfig.server = 'localhost'; // 設定預設值避免 undefined
        }
        
        if (!this.connConfig.database) {
            node.error('Database name is required but not provided');
        }
        
        if (!this.connConfig.username) {
            node.error('Username is required but not provided');
        }
        
        // 記錄配置（不包含密碼）
        node.log(`Connection config: ${JSON.stringify({
            dbType: this.dbType,
            server: this.connConfig.server,
            port: this.connConfig.port,
            database: this.connConfig.database,
            username: this.connConfig.username
        })}`);

        // 資料庫特定配置
        switch (this.dbType) {
            case 'mssql':
                this.connConfig = {
                    ...this.connConfig,
                    domain: n.domain,
                    appName: n.appName || 'atomic-schema-bridge',
                    encryption: n.encryption || false,
                    trustServerCertificate: n.trustServerCertificate || false,
                    auth: {
                        type: n.authType || 'default',
                        username: this.credentials.username,
                        password: this.credentials.password
                    }
                };
                break;
                
            case 'informix':
                this.connConfig = {
                    ...this.connConfig,
                    protocol: n.protocol || 'tcpip',
                    authentication: n.authentication || 'server',
                    client_locale: n.client_locale || 'en_us.utf8',
                    db_locale: n.db_locale || 'en_us.utf8'
                };
                break;
                
            case 'oracle':
                this.connConfig = {
                    ...this.connConfig,
                    oracleClientPath: n.oracleClientPath
                };
                break;
                
            case 'postgres':
                this.connConfig = {
                    ...this.connConfig,
                    max: Number(n.poolMax) || 10
                };
                break;
                
            case 'mysql':
                // MySQL 使用預設配置
                break;
        }

        this.poolConfig = {
            min: Number(n.poolMin) || 1,
            max: Number(n.poolMax) || 10,
            idleTimeoutMillis: Number(n.poolIdleTimeoutMillis) || 30000
        };

        // 建立客戶端連接
        const Client = require('./client');

        this.client = new Client(this.dbType, {
            connection: this.connConfig,
            pool: this.poolConfig
        });

        // 設置事件監聽
        this.client.on('disconnect', () => {
            this.status = 'disconnected';
            node.log(`Disconnected from ${this.dbType.toUpperCase()} server: ${node.connConfig.server}:${node.connConfig.port}`);
            this.instance.emit('status', { fill: 'red', shape: 'ring', text: 'disconnected' });
        });

        this.client.on('reconnect', () => {
            this.status = 'reconnecting';
            node.log(`Reconnecting to ${this.dbType.toUpperCase()} server: ${node.connConfig.server}:${node.connConfig.port}`);
            this.instance.emit('status', { fill: 'yellow', shape: 'ring', text: 'reconnecting' });
        });

        this.client.on('connected', (err) => {
            if (err) {
                node.error(`Failed to connect to ${this.dbType.toUpperCase()} server: ${err}`);
                this.status = 'disconnected';
                this.instance.emit('status', { fill: 'red', shape: 'ring', text: 'error' });
                return;
            }

            node.log(`Connected to ${this.dbType.toUpperCase()} server: ${node.connConfig.server}:${node.connConfig.port}`);
            this.status = 'connected';
            this.instance.emit('status', { fill: 'green', shape: 'dot', text: 'connected' });
        });

        this.client.on('error', (err) => {
            node.error(err);
            this.instance.emit('status', { fill: 'red', shape: 'ring', text: 'error' });
        });

        // 延遲初始連接，避免在節點啟動時就連接
        // 連接將在第一次使用時建立
        node.log(`Schema Bridge Connection node initialized for ${this.dbType.toUpperCase()} server: ${node.connConfig.server}:${node.connConfig.port}`);

        // 提供給其他節點使用的方法
        this.getClient = function () {
            // 如果客戶端沒有連接，嘗試連接
            if (node.client && !node.client.isConnected) {
                node.log('Client not connected, attempting to connect...');
                node.client.connect().catch(err => {
                    node.error('Failed to connect:', err);
                });
            }
            return node.client;
        };

        this.getPool = function () {
            return node.client.getPool();
        };

        this.query = function (sql, params) {
            return node.client.query(sql, params);
        };

        this.getConnectionConfig = function () {
            return {
                dbType: node.dbType,
                config: node.connConfig
            };
        };

        // 清理連接
        node.on('close', function () {
            if (node.client) {
                node.client.disconnect();
            }
        });
    }

    RED.nodes.registerType('Schema Bridge Connection', SchemaBridgeConnectionNode, {
        credentials: {
            username: {
                type: 'text'
            },
            password: {
                type: 'password'
            }
        }
    });
}; 