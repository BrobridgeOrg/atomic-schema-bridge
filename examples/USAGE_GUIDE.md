# Atomic Schema Bridge 使用指南

## 🚀 快速開始

### 1. 基本設定

#### 步驟一：建立連接節點
1. 拖拽 **Schema Bridge Connection** 節點到工作區
2. 配置資料庫連接：
   - 選擇資料庫類型（MSSQL/PostgreSQL/MySQL/Oracle/Informix）
   - 輸入伺服器地址、端口、資料庫名稱
   - 設定用戶名和密碼
3. 測試連接確保設定正確

#### 步驟二：建立 Schema Bridge 節點
1. 拖拽 **Schema Bridge** 節點到工作區
2. 選擇操作模式：
   - **Analyze**: 分析現有 Schema
   - **Convert**: 轉換 Schema 格式
   - **Migrate**: 完整遷移（結構+資料）

### 2. 常用工作流程

#### 🔍 Schema 分析流程
```
[Inject] → [Schema Bridge (Analyze)] → [Debug]
```
- 用於了解現有資料表結構
- 自動檢測欄位型別和約束條件

#### 🔄 跨資料庫轉換
```
[Inject] → [Schema Bridge (Convert)] → [Function] → [Debug]
```
- 將一種資料庫的 Schema 轉換為另一種
- 自動處理型別對映

#### 🚀 完整資料遷移
```
[Inject] → [Schema Bridge (Migrate)] → [Debug]
```
- 建立新表格並遷移資料
- 支援批次處理大型資料集

## 📊 範例場景

### 場景一：從 SQL Server 遷移到 PostgreSQL

1. **準備工作**
   - 設定 SQL Server 連接節點
   - 設定 PostgreSQL 連接節點

2. **執行遷移**
   ```json
   // 注入訊息
   {
     "tableName": "users"
   }
   ```

3. **預期輸出**
   - 分析後的 Schema 結構
   - 轉換後的 PostgreSQL CREATE TABLE 語句
   - 遷移完成報告

### 場景二：批次遷移多個表格

1. **注入表格清單**
   ```json
   {
     "tables": ["users", "products", "orders"]
   }
   ```

2. **使用 Split 節點分割清單**

3. **連接到 Schema Bridge 進行批次處理**

### 場景三：自訂 Schema 轉換

1. **定義自訂 Schema**
   ```json
   {
     "schema": [
       {
         "name": "id",
         "type": "SERIAL PRIMARY KEY",
         "nullable": false
       },
       {
         "name": "name",
         "type": "VARCHAR(100)",
         "nullable": false
       }
     ]
   }
   ```

2. **執行轉換並生成 SQL**

## ⚙️ 最佳實踐

### 連接設定
- 使用連接池以提高效能
- 設定適當的超時時間
- 為生產環境啟用 SSL

### 批次處理
- **小型表格** (< 10K 筆): 批次大小 1000-5000
- **中型表格** (10K-100K 筆): 批次大小 500-1000  
- **大型表格** (> 100K 筆): 批次大小 100-500

### 錯誤處理
- 在關鍵節點後加入 Catch 節點
- 使用 Function 節點記錄詳細錯誤訊息
- 設定重試機制

### 效能最佳化
- 在遷移大型表格前建立適當的索引
- 考慮在非繁忙時段執行遷移
- 監控記憶體和 CPU 使用情況

## 🛠️ 故障排除

### 常見問題

#### 連接失敗
**問題**: 無法連接到資料庫
**解決方案**:
1. 檢查網路連接
2. 確認資料庫服務運行中
3. 驗證認證資訊
4. 檢查防火牆設定

#### 型別轉換錯誤
**問題**: 無法轉換特定資料型別
**解決方案**:
1. 查看支援的型別對映表
2. 使用自訂 Schema 手動指定型別
3. 檢查來源資料的完整性

#### 記憶體不足
**問題**: 處理大型資料集時記憶體不足
**解決方案**:
1. 減少批次大小
2. 分段處理大型表格
3. 增加系統記憶體

### 除錯技巧

1. **啟用詳細日誌**
   - 在 Node-RED 設定中啟用 debug 級別日誌

2. **使用 Debug 節點**
   - 在關鍵點插入 Debug 節點查看資料流

3. **檢查節點狀態**
   - 觀察節點下方的狀態指示器

## 📁 範例檔案說明

- `example-flow.json` - 基本操作示範
- `advanced-migration-flow.json` - 企業級遷移流程
- `custom-schema-example.json` - 自訂 Schema 範例

## 🔗 相關資源

- [Node-RED 官方文檔](https://nodered.org/docs/)
- [PostgreSQL 型別文檔](https://www.postgresql.org/docs/current/datatype.html)
- [SQL Server 型別文檔](https://docs.microsoft.com/sql/t-sql/data-types/)

---

**提示**: 如需更詳細的資訊，請參考主要的 README.md 文件。 