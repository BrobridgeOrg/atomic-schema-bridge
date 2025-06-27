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

### ⚡ 三種核心操作模式

#### 📊 Analyze (分析模式)
- 讀取來源資料庫的 Schema 結構
- 自動分析欄位型別和約束條件
- 提供詳細的 Schema 報告

#### 🔄 Convert (轉換模式)
- 將 Schema 轉換為目標資料庫格式
- 智能型別對映和最佳化建議
- 生成完整的 CREATE TABLE 語句

#### 🚀 Migrate (遷移模式)
- 完整的資料表遷移（結構 + 資料）
- 支援批次處理大型資料集
- 自動處理型別轉換和資料驗證

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
- **Operation**：選擇操作類型（Analyze/Convert/Migrate）
- **Source Connection**：來源資料庫連接
- **Target Connection**：目標資料庫連接
- **Source/Target Table**：資料表名稱設定

#### Schema Editor 標籤頁
- **即時編輯 Schema**：修改欄位名稱、型別、約束
- **新增/刪除欄位**：自由調整資料表結構
- **預覽功能**：即時查看轉換結果

#### SQL Output 標籤頁
- **SQL 預覽**：查看生成的 CREATE TABLE 語句
- **複製功能**：一鍵複製 SQL 到剪貼簿

## 📖 操作模式詳解

### 🔍 Analyze 模式

**用途**：分析來源資料庫的 Schema 結構

**輸入**：
```json
{
  "tableName": "users"
}
```

**輸出範例**：
```json
{
  "operation": "analyze",
  "sourceTable": "users",
  "sourceDbType": "mssql",
  "targetDbType": "postgres",
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
  "metadata": {
    "totalColumns": 5,
    "analyzedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 🔄 Convert 模式

**用途**：轉換 Schema 為目標資料庫格式

**功能**：
- 自動型別對映
- 約束條件轉換
- SQL 語句生成

**輸出範例**：
```json
{
  "operation": "convert",
  "sourceTable": "users",
  "targetTable": "users_migrated",
  "sourceDbType": "mssql",
  "targetDbType": "postgres",
  "schema": [...],
  "sql": "CREATE TABLE users_migrated (\n  user_id INTEGER NOT NULL,\n  username VARCHAR(50),\n  ...\n);",
  "convertedAt": "2024-01-15T10:35:00.000Z"
}
```

### 🚀 Migrate 模式

**用途**：完整的資料遷移（結構 + 資料）

**特色**：
- 自動建立目標資料表
- 批次資料傳輸
- 進度追蹤和錯誤處理

**輸出範例**：
```json
{
  "operation": "migrate",
  "sourceTable": "users",
  "targetTable": "users_migrated",
  "schema": [...],
  "sql": "CREATE TABLE users_migrated (...);",
  "success": true,
  "migratedRows": 1000,
  "migratedAt": "2024-01-15T10:40:00.000Z"
}
```

## 🔗 工作流程範例

### 基本 Schema 分析
```
[inject] → [schema-bridge(analyze)] → [debug]
```

### 跨資料庫轉換
```
[inject] → [schema-bridge(convert)] → [function] → [debug]
```

### 完整資料遷移
```
[inject] → [schema-bridge(migrate)] → [debug]
```

### 複雜遷移流程
```
[inject] → [analyze] → [convert] → [customize] → [migrate] → [verify] → [debug]
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

### 批次處理最佳化

**小型資料表** (< 10,000 筆)
- 批次大小：1000-5000
- 適合快速遷移

**中型資料表** (10,000-100,000 筆)
- 批次大小：500-1000
- 平衡效能與記憶體使用

**大型資料表** (> 100,000 筆)
- 批次大小：100-500
- 避免記憶體不足

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

## 🐛 故障排除

### 連接問題

**1. 連接被拒絕**
- 檢查資料庫伺服器是否運行
- 確認防火牆設定
- 驗證連接埠是否正確

**2. 驗證失敗**
- 確認使用者名稱和密碼
- 檢查使用者權限
- 驗證資料庫存在

**3. 驅動程式錯誤**
```bash
# 重新安裝驅動程式
npm uninstall mssql pg mysql2
npm install mssql pg mysql2

# 檢查安裝狀態
npm list mssql pg mysql2
```

### Schema 轉換問題

**1. 型別不支援**
- 查看型別對映表
- 使用自訂 Schema 手動指定型別
- 檢查 Node-RED 日誌

**2. 資料遺失**
- 檢查來源表格權限
- 確認目標資料庫空間
- 調整批次大小

### 效能最佳化

**1. 連接池設定**
```javascript
{
  "poolMin": 1,
  "poolMax": 10,
  "poolIdleTimeoutMillis": 30000
}
```

**2. 查詢最佳化**
- 增加索引
- 調整批次大小
- 使用資料庫特定的最佳化選項

## 📁 範例檔案

查看 `examples/` 目錄中的完整範例：

- `example-flow.json` - 基本操作示範
- `advanced-migration-flow.json` - 進階遷移流程
- `custom-schema-example.json` - 自訂 Schema 範例

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權條款

此專案採用 MIT 授權條款。 