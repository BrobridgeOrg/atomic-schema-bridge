# Atomic Schema Bridge

一個專為 Node-RED 設計的強大資料庫 Schema 遷移工具，提供跨資料庫平台的無縫資料結構轉換和遷移功能。

## ✨ 核心特色

### 🎯 多資料庫支援
- **Microsoft SQL Server** - 完整支援包含 Windows 驗證
- **PostgreSQL** - 支援連接池和 SSL 連接
- **MySQL/MariaDB** - 支援最新版本和連接選項
- **Oracle Database** - 支援 Oracle 客戶端程式庫
- **IBM Informix** - 支援多種連接協定和驗證方式

### 🔧 獨立連接管理
- **可重複使用的連接節點** - 一次設定，多處使用
- **連接池管理** - 自動最佳化資料庫連接
- **即時連接測試** - 視覺化連接狀態指示
- **自動重連機制** - 提高系統穩定性

### 🎨 視覺化操作介面
- **三標籤頁設計** - 基本設定 / Schema 編輯器 / SQL 輸出
- **互動式 Schema 編輯器** - 拖拽編輯、即時預覽
- **智能型別轉換** - 自動對映最適合的資料型別
- **SQL 即時生成** - 即時預覽 CREATE TABLE 語句

### ⚡ 雙核心操作模式

#### 🔗 Database Connection Mode（資料庫連線模式）
- **完整連接**：同時連接來源和目標資料庫
- **雙重功能**：可選擇 Generate SQL 和/或 Create Table
- **即時執行**：直接在目標資料庫建立表格
- **狀態顯示**：`both connected` / `source only` / `target only`

#### 📝 SQL Generation Mode（SQL 生成模式）
- **輕量連接**：僅需來源資料庫連接
- **類型選擇**：選擇目標資料庫類型（PostgreSQL, MSSQL, MySQL 等）
- **純 SQL 輸出**：生成標準 CREATE TABLE 語句
- **狀態顯示**：`source connected | postgres mode`

### 🛠️ 簡化操作選項

#### Generate SQL（預設啟用）
- 自動分析來源 Schema 結構
- 智能型別對映和轉換
- 生成完整的 CREATE TABLE 語句
- 支援約束條件和預設值

#### Create Table（可選）
- 在目標資料庫執行 SQL 語句
- 自動建立資料表結構
- 僅在 Connection Mode 下可用
- 即時回饋執行狀態

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
# 必要驅動（自動安裝）
npm install mssql pg mysql2

# 選用驅動（根據需要安裝）
npm install oracledb ibm_db
```

## 🎯 使用指南

### 步驟 1：建立資料庫連接

1. 從 Node-RED 調色盤拖拽 **Schema Bridge Connection** 節點
2. 雙擊節點開啟設定面板
3. 設定資料庫連接資訊：

**基本設定**
- Database Type：選擇資料庫類型
- Server：資料庫伺服器地址
- Port：連接埠（自動填入預設值）
- Database：資料庫名稱
- Username/Password：驗證資訊

**進階設定**
- Connection Pool：連接池大小設定
- Timeout：連接和請求逾時設定
- Retry：重連間隔設定

### 步驟 2：設定 Schema Bridge 節點

1. 拖拽 **Schema Bridge** 節點到工作區
2. 連接到資料庫連接節點
3. 在設定面板中選擇操作模式和參數

#### Basic 標籤頁

**操作模式選擇**
- **🔗 Database Connection Mode**：完整資料庫連接模式
- **📝 SQL Generation Mode**：輕量 SQL 生成模式

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

#### Schema Editor 標籤頁
- **Load Schema**：從來源資料庫載入表格結構
- **即時編輯 Schema**：修改欄位名稱、型別、約束
- **新增/刪除欄位**：自由調整資料表結構
- **預覽功能**：即時查看轉換結果

#### SQL Output 標籤頁
- **SQL 預覽**：查看生成的 CREATE TABLE 語句
- **複製功能**：一鍵複製 SQL 到剪貼簿

## 📖 操作模式詳解

### 🔗 Database Connection Mode

**適用場景**：需要直接在目標資料庫建立表格

**設定需求**：
- 來源資料庫連接
- 目標資料庫連接

**可用功能**：
- ✅ Generate SQL
- ✅ Create Table

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
      "scale": 0
    }
  ],
  "sql": "CREATE TABLE users_new (\n  user_id INTEGER NOT NULL,\n  username VARCHAR(50),\n  ...\n);",
  "success": true,
  "message": "SQL generated and table created successfully",
  "processedAt": "2024-01-15T10:30:00.000Z"
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

**輸出範例**：
```json
{
  "operationMode": "generation",
  "sourceTable": "products",
  "sourceDbType": "mssql",
  "targetDbType": "postgres",
  "generateSql": true,
  "createTable": false,
  "schema": [...],
  "sql": "CREATE TABLE products (\n  product_id INTEGER NOT NULL,\n  name VARCHAR(100),\n  ...\n);",
  "success": true,
  "message": "SQL generated successfully",
  "processedAt": "2024-01-15T10:35:00.000Z"
}
```

## 🔗 工作流程範例

### 基本 SQL 生成（Generation Mode）
```
[inject] → [schema-bridge(generation)] → [debug]
```

### 完整表格建立（Connection Mode）
```
[inject] → [schema-bridge(connection)] → [debug]
```

### 批次 SQL 生成
```
[inject] → [split] → [schema-bridge(generation)] → [join] → [debug]
```

### 先生成後建立的流程
```
[inject] → [generate-sql] → [validate] → [create-table] → [debug]
```

## 🔧 型別轉換對映表

### 數值型別
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| INTEGER | INT | INTEGER | INT | NUMBER(10) | INTEGER |
| BIGINT | BIGINT | BIGINT | BIGINT | NUMBER(19) | BIGINT |
| DECIMAL | DECIMAL | DECIMAL | DECIMAL | NUMBER | DECIMAL |
| FLOAT | FLOAT | REAL | FLOAT | BINARY_FLOAT | FLOAT |
| DOUBLE | FLOAT(53) | DOUBLE PRECISION | DOUBLE | BINARY_DOUBLE | DOUBLE PRECISION |

### 字串型別
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| VARCHAR | NVARCHAR | VARCHAR | VARCHAR | VARCHAR2 | VARCHAR |
| TEXT | NTEXT | TEXT | TEXT | CLOB | TEXT |
| CHAR | NCHAR | CHAR | CHAR | CHAR | CHAR |

### 日期時間型別
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| DATE | DATE | DATE | DATE | DATE | DATE |
| TIMESTAMP | DATETIME2 | TIMESTAMP | DATETIME | TIMESTAMP | DATETIME |
| TIME | TIME | TIME | TIME | TIME | TIME |

### 其他型別
| 標準型別 | MSSQL | PostgreSQL | MySQL | Oracle | Informix |
|---------|--------|------------|-------|--------|----------|
| BOOLEAN | BIT | BOOLEAN | BOOLEAN | NUMBER(1) | BOOLEAN |
| BLOB | VARBINARY | BYTEA | BLOB | BLOB | BLOB |
| UUID | UNIQUEIDENTIFIER | UUID | CHAR(36) | VARCHAR2(36) | CHAR(36) |

## 🛠️ API 端點

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
    "password": "pass"
  }
}
```

### 檢查連接狀態
```http
POST /schema-bridge/check-connections
Content-Type: application/json

{
  "nodeId": "schema-bridge-node-id"
}
```

### 獲取資料表清單
```http
POST /schema-bridge/connection-tables
Content-Type: application/json

{
  "connectionId": "connection-node-id"
}
```

### 獲取 Schema 結構
```http
POST /schema-bridge/connection-schema
Content-Type: application/json

{
  "connectionId": "connection-node-id",
  "tableName": "users"
}
```

## 🔧 進階設定

### 自訂 Schema 格式

```json
[
  {
    "name": "id",
    "type": "SERIAL PRIMARY KEY",
    "nullable": false
  },
  {
    "name": "name",
    "type": "VARCHAR(100)",
    "nullable": false,
    "defaultValue": "'Unknown'"
  },
  {
    "name": "created_at",
    "type": "TIMESTAMP",
    "nullable": false,
    "defaultValue": "CURRENT_TIMESTAMP"
  }
]
```

### 配置參數說明

```javascript
// 新的簡化配置格式
{
  "operationMode": "connection|generation",
  "generateSql": true,        // 產生 SQL（預設啟用）
  "createTable": false,       // 建立表格（預設禁用）
  "targetDbType": "postgres", // 僅 Generation Mode 需要
  "sourceTable": "users",
  "targetTable": "users_new"  // 可選
}
```

## 🐛 故障排除

### 連接問題

**1. 連接狀態顯示 "checking connections..."**
- 等待幾秒讓系統完成連接測試
- 檢查資料庫伺服器是否運行
- 確認防火牆設定

**2. "source only" 或 "target only" 狀態**
- 檢查另一個資料庫連接設定
- 確認使用者權限
- 驗證資料庫存在

**3. Generation Mode 下 Create Table 被禁用**
- 這是正常行為，Generation Mode 只產生 SQL
- 如需建表功能，請切換到 Connection Mode

### Schema 載入問題

**1. Load Schema 按鈕載入中不停止**
- 檢查來源資料庫連接狀態
- 確認表格名稱正確
- 查看 Node-RED 日誌錯誤訊息

**2. 型別轉換錯誤**
- 查看型別對映表
- 使用 Schema Editor 手動調整型別
- 檢查來源資料庫版本支援

### 效能最佳化

**1. 連接池設定**
```javascript
{
  "poolMin": 1,
  "poolMax": 10,
  "poolIdleTimeoutMillis": 30000
}
```

**2. Schema 處理最佳化**
- 使用具體表格名稱而非萬用字元
- 避免載入過大的表格 Schema
- 適當調整連接逾時設定

## 📁 範例檔案

查看 `examples/` 目錄中的完整範例：

- `example-flow.json` - 基本 SQL 生成和表格建立示範

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權條款

此專案採用 MIT 授權條款。 