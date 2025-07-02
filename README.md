# Atomic Schema Bridge

一個專為 Node-RED 設計的強大資料庫 Schema 遷移工具，提供跨資料庫平台的無縫資料結構轉換和遷移功能。

## ✨ 核心特色

### 🎯 全面資料庫支援
- **Microsoft SQL Server** - 完整支援包含 Windows 驗證和加密連接
- **PostgreSQL** - 支援連接池、SSL 連接和最新版本特性
- **MySQL/MariaDB** - 支援最新版本和進階連接選項
- **Oracle Database** - 完整支援 Oracle 客戶端程式庫和連接池
- **IBM Informix** - 支援多種連接協定和驗證方式

### 🔧 智慧連接管理
- **可重複使用的連接節點** - 一次設定，多處使用
- **進階連接池管理** - 自動最佳化資料庫連接，支援連接池配置
- **即時連接測試** - 視覺化連接狀態指示，支援 `both connected` / `source only` / `target only` 狀態
- **自動重連機制** - 提高系統穩定性和錯誤恢復能力
- **智慧錯誤處理** - 友善的錯誤訊息和故障排除提示

### 🎨 現代化視覺介面
- **紅黑主題設計** - 美觀的深色主題，支援動畫效果和懸停特效
- **三標籤頁架構** - Basic 設定 / Schema Editor / SQL Output
- **互動式 Schema 編輯器** - 拖拽編輯、即時預覽、批次操作
- **智能 Nullable 控制** - 主控制 checkbox 支援全選/部分選取/取消全選
- **即時 SQL 預覽** - 實時生成和預覽 CREATE TABLE 語句

### ⚡ 雙核心操作模式

#### 🔗 Database Connection Mode（資料庫連線模式）
- **完整連接**：同時連接來源和目標資料庫
- **雙重功能**：可選擇 Generate SQL 和/或 Create Table
- **即時執行**：直接在目標資料庫建立表格
- **狀態顯示**：`both connected` / `source only` / `target only`

#### 📝 SQL Generation Mode（SQL 生成模式）
- **輕量連接**：僅需來源資料庫連接
- **類型選擇**：選擇目標資料庫類型（PostgreSQL, MSSQL, MySQL, Oracle, Informix）
- **純 SQL 輸出**：生成標準 CREATE TABLE 語句
- **狀態顯示**：`source connected | postgres mode`

### 🛠️ 簡化操作選項

#### Generate SQL（預設啟用）
- 智慧分析來源 Schema 結構
- 先進型別對映和轉換系統
- 生成完整的 CREATE TABLE 語句
- 支援約束條件、預設值和精度設定

#### Create Table（可選）
- 在目標資料庫安全執行 SQL 語句
- 自動建立資料表結構
- 僅在 Connection Mode 下可用
- 即時回饋執行狀態和錯誤處理

### 🧠 智能型別轉換系統
- **語義型別分類** - 基於數據語義進行智慧映射
- **精度保持** - 自動保持數值精度和尺度
- **型別備援** - 當目標資料庫不支援特定型別時自動選擇最佳替代
- **自訂映射** - 支援使用者自定義型別轉換規則

## 🚀 快速開始

### 安裝要求

1. **Node-RED 環境**（版本 ≥ 1.0.0）
2. **Node.js**（版本 ≥ 14.0.0）

### 安裝步驟

```bash
# 進入 Node-RED 用戶目錄
cd ~/.node-red

# 安裝 atomic-schema-bridge
npm install atomic-schema-bridge

# 重啟 Node-RED
node-red-stop && node-red-start
```

### 安裝資料庫驅動程式

```bash
# 核心驅動（自動安裝）
npm install mssql@^11.0.1 # Microsoft SQL Server 驅動
npm install pg@^8.12.0 # PostgreSQL 驅動
npm install mysql2@^3.11.3 # MySQL 驅動
npm install oracledb@^6.8.0  # Oracle 驅動
npm install ibm_db@^3.3.2    # Informix 驅動
```

## 🎯 詳細使用指南

### 步驟 1：建立資料庫連接

1. 從 Node-RED 調色盤拖拽 **Schema Bridge Connection** 節點
2. 雙擊節點開啟設定面板
3. 設定資料庫連接資訊：

**基本設定**
- Database Type：選擇資料庫類型（MSSQL, PostgreSQL, MySQL, Oracle, Informix）
- Server：資料庫伺服器地址
- Port：連接埠（自動填入預設值）
- Database：資料庫名稱
- Username/Password：驗證資訊

**進階設定（新功能）**
- Connection Pool：連接池大小設定（min/max connections）
- Timeout：連接和請求逾時設定
- Retry：重連間隔和次數設定
- Encryption：SSL/TLS 加密選項（支援 MSSQL）

### 步驟 2：設定 Schema Bridge 節點

1. 拖拽 **Schema Bridge** 節點到工作區
2. 連接到資料庫連接節點
3. 在設定面板中選擇操作模式和參數

#### Basic 標籤頁

**操作模式選擇（新功能）**
- **🔗 Database Connection Mode**：完整資料庫連接模式
  - 支援雙資料庫連接
  - 可生成 SQL 並直接建立表格
  - 即時狀態監控
- **📝 SQL Generation Mode**：輕量 SQL 生成模式
  - 僅需來源資料庫連接
  - 選擇目標資料庫類型
  - 純 SQL 輸出

**Connection Mode 設定**
- **Source Connection**：來源資料庫連接
- **Target Connection**：目標資料庫連接
- **Source Table**：來源資料表名稱
- **Target Table**：目標資料表名稱（可選）

**Generation Mode 設定**
- **Source Connection**：來源資料庫連接
- **Target Database Type**：目標資料庫類型選擇
- **Source Table**：來源資料表名稱

**功能選擇**
- **Generate SQL**：產生 CREATE TABLE 語句（預設啟用）
- **Create Table**：在目標資料庫建立表格（僅 Connection Mode）

#### Schema Editor 標籤頁（全新設計）
- **Load Schema**：從來源資料庫載入表格結構
- **互動式編輯**：修改欄位名稱、型別、約束條件
- **批次操作**：
  - Nullable 主控制 checkbox（支援全選/部分選取/取消全選）
  - 批次型別轉換
  - 批次新增/刪除欄位
- **即時預覽**：實時查看型別轉換結果
- **視覺化回饋**：懸停效果和狀態指示

#### SQL Output 標籤頁（增強功能）
- **即時 SQL 預覽**：查看生成的 CREATE TABLE 語句
- **語法高亮**：SQL 代碼語法著色
- **複製功能**：一鍵複製 SQL 到剪貼簿
- **格式化選項**：美化 SQL 輸出格式

## 📖 操作模式詳解

### 🔗 Database Connection Mode

**適用場景**：需要直接在目標資料庫建立表格

**設定需求**：
- 來源資料庫連接
- 目標資料庫連接

**可用功能**：
- ✅ Generate SQL
- ✅ Create Table
- ✅ 即時連接狀態監控
- ✅ 自動錯誤處理

**輸入範例**：
```json
{
  "tableName": "users"
}
```

**輸出範例**：
```json
{
  "operationMode": "connection",
  "sourceTable": "users",
  "targetTable": "users_new",
  "sourceDbType": "mssql",
  "targetDbType": "postgres",
  "generateSql": true,
  "createTable": true,
  "schema": [
    {
      "originalName": "user_id",
      "name": "user_id",
      "originalType": "int",
      "standardType": "INTEGER",
      "mappedType": "INTEGER", 
      "nullable": false,
      "defaultValue": null,
      "length": null,
      "precision": 10,
      "scale": 0,
      "category": "integer_normal"
    }
  ],
  "sql": "CREATE TABLE users_new (\n  user_id INTEGER NOT NULL,\n  username VARCHAR(50),\n  email VARCHAR(100),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);",
  "success": true,
  "message": "SQL generated and table created successfully",
  "processedAt": "2024-01-15T10:30:00.000Z",
  "executionTime": "250ms"
}
```

### 📝 SQL Generation Mode

**適用場景**：僅需要生成 SQL 語句，不執行建表

**設定需求**：
- 來源資料庫連接
- 目標資料庫類型選擇

**可用功能**：
- ✅ Generate SQL
- ❌ Create Table（自動禁用）
- ✅ 多目標資料庫類型支援
- ✅ 輕量化操作

**輸出範例**：
```json
{
  "operationMode": "generation",
  "sourceTable": "products",
  "sourceDbType": "mssql",
  "targetDbType": "postgres",
  "generateSql": true,
  "createTable": false,
  "schema": [
    {
      "originalName": "product_id",
      "name": "product_id",
      "originalType": "int",
      "standardType": "INTEGER",
      "mappedType": "INTEGER",
      "nullable": false,
      "category": "integer_normal"
    }
  ],
  "sql": "CREATE TABLE products (\n  product_id INTEGER NOT NULL,\n  name VARCHAR(100),\n  price DECIMAL(10,2),\n  description TEXT\n);",
  "success": true,
  "message": "SQL generated successfully",
  "processedAt": "2024-01-15T10:35:00.000Z",
  "executionTime": "180ms"
}
```

## 🔗 進階工作流程範例

### 基本 SQL 生成（Generation Mode）
```
[inject] → [schema-bridge(generation)] → [debug]
```

### 完整表格建立（Connection Mode）
```
[inject] → [schema-bridge(connection)] → [debug]
```

### 批次 SQL 生成（新功能）
```
[inject] → [split] → [schema-bridge(generation)] → [join] → [debug]
```

### 自訂 Schema 處理流程
```
[inject] → [function(prepare-schema)] → [schema-bridge] → [template(format-sql)] → [debug]
```

### 錯誤處理和重試流程
```
[inject] → [schema-bridge] → [switch(check-success)] → [retry-logic] → [debug]
```

## 🔧 智能型別轉換對映表

### 新增的語義型別分類
| 語義分類 | 描述 | 包含型別 |
|---------|------|----------|
| integer_small | 小整數 | SMALLINT, TINYINT |
| integer_normal | 標準整數 | INTEGER, INT, MEDIUMINT |
| integer_big | 大整數 | BIGINT |
| integer_auto | 自增整數 | SERIAL, BIGSERIAL |
| float_small | 單精度浮點 | REAL, SMALLFLOAT, BINARY_FLOAT |
| float_normal | 標準浮點 | FLOAT |
| float_big | 雙精度浮點 | DOUBLE, DOUBLE PRECISION, BINARY_DOUBLE |
| decimal | 精確數值 | DECIMAL, NUMERIC, NUMBER, MONEY |
| char_fixed | 固定長度字串 | CHAR, NCHAR |
| char_variable | 可變長度字串 | VARCHAR, NVARCHAR, VARCHAR2, NVARCHAR2 |
| char_large | 大文本 | TEXT, NTEXT, CLOB, NCLOB, LONG |
| char_small | 小文本 | TINYTEXT |
| date_only | 僅日期 | DATE |
| time_only | 僅時間 | TIME |
| datetime | 日期時間 | DATETIME, DATETIME2, SMALLDATETIME |
| timestamp | 時間戳 | TIMESTAMP, TIMESTAMPTZ |
| boolean | 布林值 | BOOLEAN, BOOL, BIT |
| binary_large | 大二進位 | BLOB, BYTE, BYTEA, IMAGE |

### 數值型別對映
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| INTEGER | INT | INTEGER | INT | NUMBER(10) | INTEGER |
| BIGINT | BIGINT | BIGINT | BIGINT | NUMBER(19) | BIGINT |
| SMALLINT | SMALLINT | SMALLINT | SMALLINT | NUMBER(5) | SMALLINT |
| DECIMAL | DECIMAL | DECIMAL | DECIMAL | NUMBER | DECIMAL |
| FLOAT | FLOAT | REAL | FLOAT | BINARY_FLOAT | SMALLFLOAT |
| DOUBLE | FLOAT(53) | DOUBLE PRECISION | DOUBLE | BINARY_DOUBLE | FLOAT |
| MONEY | MONEY | DECIMAL(19,2) | DECIMAL(19,2) | NUMBER(19,2) | MONEY |

### 字串型別對映
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| CHAR(n) | NCHAR(n) | CHAR(n) | CHAR(n) | CHAR(n) | CHAR(n) |
| VARCHAR(n) | NVARCHAR(n) | VARCHAR(n) | VARCHAR(n) | VARCHAR2(n) | VARCHAR(n) |
| TEXT | NTEXT | TEXT | TEXT | CLOB | TEXT |
| LONGTEXT | NTEXT | TEXT | LONGTEXT | CLOB | TEXT |

### 日期時間型別對映
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| DATE | DATE | DATE | DATE | DATE | DATE |
| TIME | TIME | TIME | TIME | TIMESTAMP | DATETIME |
| DATETIME | DATETIME2 | TIMESTAMP | DATETIME | DATE | DATETIME |
| TIMESTAMP | DATETIME2 | TIMESTAMP | TIMESTAMP | TIMESTAMP | DATETIME |

### 其他型別對映
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| BOOLEAN | BIT | BOOLEAN | BOOLEAN | NUMBER(1) | BOOLEAN |
| BLOB | VARBINARY(MAX) | BYTEA | BLOB | BLOB | BYTE |
| UUID | UNIQUEIDENTIFIER | UUID | CHAR(36) | VARCHAR2(36) | CHAR(36) |

## 🛠️ 增強的 API 端點

### 測試連接
```http
POST /schema-bridge/test-connection
Content-Type: application/json

{
  "dbType": "mssql",
  "config": {
    "server": "localhost",
    "database": "testdb",
    "username": "user",
    "password": "pass",
    "encryption": false,
    "trustServerCertificate": true
  }
}
```

### 檢查連接狀態（新功能）
```http
POST /schema-bridge/check-connections
Content-Type: application/json

{
  "nodeId": "schema-bridge-node-id"
}

Response:
{
  "sourceConnected": true,
  "targetConnected": false,
  "status": "source only",
  "lastChecked": "2024-01-15T10:30:00.000Z"
}
```

### 獲取資料表清單
```http
POST /schema-bridge/connection-tables
Content-Type: application/json

{
  "connectionId": "connection-node-id"
}

Response:
{
  "tables": ["users", "products", "orders"],
  "count": 3,
  "dbType": "mssql"
}
```

### 獲取 Schema 結構（增強版）
```http
POST /schema-bridge/connection-schema
Content-Type: application/json

{
  "connectionId": "connection-node-id",
  "tableName": "users"
}

Response:
{
  "tableName": "users",
  "columns": [
    {
      "name": "user_id",
      "type": "int",
      "nullable": false,
      "defaultValue": null,
      "precision": 10,
      "scale": 0,
      "length": null,
      "category": "integer_normal"
    }
  ],
  "constraints": [...],
  "indexes": [...]
}
```

## 🔧 進階設定和自訂

### 自訂 Schema 格式

```json
[
  {
    "name": "id",
    "type": "SERIAL PRIMARY KEY",
    "nullable": false,
    "category": "integer_auto"
  },
  {
    "name": "name",
    "type": "VARCHAR(100)",
    "nullable": false,
    "defaultValue": "'Unknown'",
    "category": "char_variable"
  },
  {
    "name": "created_at",
    "type": "TIMESTAMP",
    "nullable": false,
    "defaultValue": "CURRENT_TIMESTAMP",
    "category": "timestamp"
  },
  {
    "name": "price",
    "type": "DECIMAL(10,2)",
    "nullable": true,
    "precision": 10,
    "scale": 2,
    "category": "decimal"
  }
]
```

### 進階配置參數

```javascript
// 新的簡化配置格式
{
  "operationMode": "connection|generation",
  "generateSql": true,        // 產生 SQL（預設啟用）
  "createTable": false,       // 建立表格（預設禁用）
  "targetDbType": "postgres", // 僅 Generation Mode 需要
  "sourceTable": "users",
  "targetTable": "users_new", // 可選
  
  // 新增的配置選項
  "preservePrecision": true,  // 保持數值精度
  "handleUnsupportedTypes": "fallback", // 不支援型別的處理方式
  "customTypeMapping": {},    // 自訂型別映射
  "schemaValidation": true,   // Schema 驗證
  "sqlFormatting": {
    "indentation": "  ",      // SQL 縮排
    "uppercase": true,        // 關鍵字大寫
    "addComments": true       // 加入註解
  }
}
```

### 連接池進階設定

```javascript
// MSSQL 連接池設定
{
  "pool": {
    "max": 10,                    // 最大連接數
    "min": 1,                     // 最小連接數
    "acquireTimeoutMillis": 30000, // 獲取連接逾時
    "idleTimeoutMillis": 30000,    // 閒置連接逾時
    "reapIntervalMillis": 1000     // 回收間隔
  }
}

// PostgreSQL 連接池設定
{
  "pool": {
    "max": 20,
    "min": 5,
    "connectionTimeoutMillis": 2000,
    "idleTimeoutMillis": 10000
  }
}

// Oracle 連接池設定
{
  "pool": {
    "poolMax": 10,
    "poolMin": 1,
    "poolTimeout": 60,
    "poolPingInterval": 60000,
    "poolPingTimeout": 5000,
    "queueMax": 100,
    "queueTimeout": 15000
  }
}
```

## 🐛 故障排除（增強版）

### 連接問題

**1. 連接狀態顯示 "checking connections..."**
- 等待3-5秒讓系統完成連接測試
- 檢查資料庫伺服器是否運行
- 確認防火牆設定
- 驗證連接池配置

**2. "source only" 或 "target only" 狀態**
- 檢查另一個資料庫連接設定
- 確認使用者權限和資料庫存在
- 驗證網路連接和DNS解析
- 檢查連接字串格式

**3. Generation Mode 下 Create Table 被禁用**
- 這是正常行為，Generation Mode 只產生 SQL
- 如需建表功能，請切換到 Connection Mode

**4. Oracle 特定問題**
- 確認 Oracle Instant Client 已安裝
- 檢查 `oracleClientPath` 設定
- 驗證 TNS 名稱和連接字串
- 確認 Oracle 服務正在運行

**5. Informix 特定問題**
- 確認 IBM DB2 客戶端已安裝
- 檢查連接字串格式
- 驗證 INFORMIXDIR 環境變數
- 確認資料庫伺服器連接協定

### Schema 載入問題

**1. Load Schema 按鈕載入中不停止**
- 檢查來源資料庫連接狀態
- 確認表格名稱正確且存在
- 查看 Node-RED 日誌錯誤訊息
- 檢查使用者權限（需要 SELECT 權限）

**2. 型別轉換錯誤**
- 查看型別對映表和語義分類
- 使用 Schema Editor 手動調整型別
- 檢查來源資料庫版本支援
- 啟用 `handleUnsupportedTypes` 選項

**3. 精度丟失問題**
- 啟用 `preservePrecision` 選項
- 手動調整精度和尺度設定
- 檢查目標資料庫的型別限制

### 效能最佳化

**1. 連接池最佳化**
```javascript
// 高流量環境設定
{
  "poolMin": 5,
  "poolMax": 20,
  "poolIdleTimeoutMillis": 60000,
  "connectionTimeoutMillis": 5000
}

// 低流量環境設定
{
  "poolMin": 1,
  "poolMax": 5,
  "poolIdleTimeoutMillis": 30000,
  "connectionTimeoutMillis": 15000
}
```

**2. Schema 處理最佳化**
- 使用具體表格名稱而非萬用字元
- 避免載入包含大量欄位的表格 Schema
- 適當調整連接逾時設定
- 啟用 Schema 快取（開發中功能）

**3. 記憶體使用最佳化**
- 設定合理的連接池大小
- 及時關閉不需要的連接
- 定期清理 Schema 快取

### 錯誤碼參考

| 錯誤碼 | 描述 | 解決方案 |
|--------|------|----------|
| CONN_001 | 連接失敗 | 檢查連接設定和網路 |
| CONN_002 | 驗證失敗 | 檢查使用者名稱和密碼 |
| SCHEMA_001 | 表格不存在 | 確認表格名稱正確 |
| SCHEMA_002 | 權限不足 | 確認使用者有 SELECT 權限 |
| TYPE_001 | 不支援的型別 | 使用自訂型別映射 |
| SQL_001 | SQL 語法錯誤 | 檢查生成的 SQL 語句 |

## 📁 範例檔案

查看 `examples/` 目錄中的完整範例：
- `example-flow.json` - 包含以下示範：
  - **SQL Generation Mode** - 基本 SQL 生成示範
  - **Database Connection Mode** - 完整表格建立示範  
  - **批次 SQL 生成** - 多表格批次處理示範
  - **自訂 Schema 處理** - 進階 Schema 自訂示範
  - **錯誤處理流程** - 完整的錯誤處理和重試邏輯

### 範例用法場景

**1. 開發環境快速原型**
```json
{
  "operationMode": "generation",
  "targetDbType": "postgres",
  "generateSql": true
}
```

**2. 生產環境資料遷移**
```json
{
  "operationMode": "connection",
  "generateSql": true,
  "createTable": true,
  "preservePrecision": true,
  "schemaValidation": true
}
```

**3. 多資料庫同步**
```javascript
// 使用 Node-RED 流程進行多目標同步
const targetDatabases = ['postgres', 'mysql', 'oracle'];
targetDatabases.forEach(dbType => {
  // 為每個目標資料庫生成對應 SQL
});
```

## 🤝 貢獻指南

我們歡迎社群貢獻！請參閱以下方式：

### 如何貢獻
1. **Fork** 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 **Pull Request**

### 報告問題
- 使用 GitHub Issues 報告 bug
- 提供詳細的錯誤訊息和重現步驟
- 包含環境資訊（Node-RED 版本、資料庫版本等）

### 功能請求
- 在 Issues 中描述期望的功能
- 解釋使用案例和優先級
- 提供實作建議（如果有的話）

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件。

---

**Atomic Schema Bridge** - 讓跨資料庫 Schema 遷移變得簡單高效 🚀 