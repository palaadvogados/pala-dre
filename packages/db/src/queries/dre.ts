import { pool } from "../pool.js"

export interface DbAccount {
  code: string
  name: string
  parent_code: string | null
  nature: string
  sign: number
  level: number
  is_total: boolean
  order_index: number
  category_code: string | null
  clickup_option_index: number | null
}

export interface DbEntry {
  id: number
  account_code: string
  period: string
  amount: string
  description: string | null
  client: string | null
  project: string | null
  bank: string | null
  payment_method: string | null
  status: string | null
  source: string
  source_id: string | null
  clickup_task_id: string | null
  clickup_list_id: string | null
  cost_center_code: string | null
  entry_type: string | null
  created_at: string
  updated_at: string
}

export interface DbReportLine {
  id: number
  code: string
  label: string
  line_type: "account" | "computed" | "separator" | "header"
  formula: string | null
  account_code: string | null
  parent_id: number | null
  order_index: number
  is_bold: boolean
  indent_level: number
  nature: string | null
  visible: boolean
  report_id: string
}

export interface DbCostCenter {
  id: number
  code: string
  name: string
  active: boolean
}

export interface DbBudgetEntry {
  account_code: string
  period: string
  amount: string
  cost_center_code: string | null
}

export async function getAllAccounts(): Promise<DbAccount[]> {
  const result = await pool.query<DbAccount>(
    "SELECT code, name, parent_code, nature, sign, level, is_total, order_index, category_code, clickup_option_index FROM dre_accounts ORDER BY order_index"
  )
  return result.rows
}

export async function getEntriesByPeriod(period: string): Promise<DbEntry[]> {
  const periodDate = period + "-01"
  const result = await pool.query<DbEntry>(
    "SELECT * FROM dre_entries WHERE DATE_TRUNC('month', period) = DATE_TRUNC('month', $1::date) ORDER BY created_at",
    [periodDate]
  )
  return result.rows
}

export async function getEntriesByPeriodRange(
  periodFrom: string,
  periodTo: string,
  costCenters?: string[] | null,
  analysisType?: string | null
): Promise<DbEntry[]> {
  const fromDate = periodFrom + "-01"
  const toDate = periodTo + "-01"
  const params: unknown[] = [fromDate, toDate]
  let sql = "SELECT * FROM dre_entries WHERE DATE_TRUNC('month', period) >= DATE_TRUNC('month', $1::date) AND DATE_TRUNC('month', period) <= DATE_TRUNC('month', $2::date)"
  if (costCenters && costCenters.length > 0) {
    params.push(costCenters)
    sql += ` AND cost_center_code = ANY($${params.length}::text[])`
  }
  if (analysisType) {
    params.push(analysisType)
    sql += ` AND entry_type = $${params.length}`
  }
  sql += " ORDER BY created_at"
  const result = await pool.query<DbEntry>(sql, params)
  return result.rows
}

export async function getEntriesByPeriodWithFilters(
  period: string,
  costCenters?: string[] | null,
  analysisType?: string | null
): Promise<DbEntry[]> {
  return getEntriesByPeriodRange(period, period, costCenters, analysisType)
}

export async function getEntriesByAccount(
  code: string,
  period: string
): Promise<DbEntry[]> {
  const periodDate = period + "-01"
  const result = await pool.query<DbEntry>(
    "SELECT * FROM dre_entries WHERE account_code = $1 AND DATE_TRUNC('month', period) = DATE_TRUNC('month', $2::date) ORDER BY created_at",
    [code, periodDate]
  )
  return result.rows
}

export async function getReportLines(reportId = "padrao"): Promise<DbReportLine[]> {
  const result = await pool.query<DbReportLine>(
    "SELECT id, code, label, line_type, formula, account_code, parent_id, order_index, is_bold, indent_level, nature, visible, report_id FROM dre_report_lines WHERE report_id = $1 AND visible = true ORDER BY order_index",
    [reportId]
  )
  return result.rows
}

export async function getCostCenters(): Promise<DbCostCenter[]> {
  const result = await pool.query<DbCostCenter>(
    "SELECT id, code, name, active FROM dre_cost_centers WHERE active = true ORDER BY code"
  )
  return result.rows
}

export async function getBudgetByPeriodRange(
  periodFrom: string,
  periodTo: string,
  costCenters?: string[] | null
): Promise<DbBudgetEntry[]> {
  const fromDate = periodFrom + "-01"
  const toDate = periodTo + "-01"
  const params: unknown[] = [fromDate, toDate]
  let sql = `
    SELECT account_code, TO_CHAR(period, 'YYYY-MM') as period, SUM(amount)::text as amount, cost_center_code
    FROM dre_budget
    WHERE DATE_TRUNC('month', period) >= DATE_TRUNC('month', $1::date)
      AND DATE_TRUNC('month', period) <= DATE_TRUNC('month', $2::date)
  `
  if (costCenters && costCenters.length > 0) {
    params.push(costCenters)
    sql += ` AND cost_center_code = ANY($${params.length}::text[])`
  }
  sql += " GROUP BY account_code, period, cost_center_code"
  const result = await pool.query<DbBudgetEntry>(sql, params)
  return result.rows
}

export interface UpsertEntryData {
  account_code: string
  period: string
  amount: number
  description?: string | null
  client?: string | null
  project?: string | null
  bank?: string | null
  payment_method?: string | null
  status?: string | null
  source?: string
  source_id?: string | null
  clickup_task_id?: string | null
  clickup_list_id?: string | null
  cost_center_code?: string | null
  entry_type?: string | null
}

export async function upsertEntry(data: UpsertEntryData): Promise<DbEntry> {
  const result = await pool.query<DbEntry>(
    `INSERT INTO dre_entries (account_code, period, amount, description, client, project, bank, payment_method, status, source, source_id, clickup_task_id, clickup_list_id, cost_center_code, entry_type, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
     ON CONFLICT (source_id) DO UPDATE SET
       account_code = EXCLUDED.account_code,
       period = EXCLUDED.period,
       amount = EXCLUDED.amount,
       description = EXCLUDED.description,
       client = EXCLUDED.client,
       project = EXCLUDED.project,
       bank = EXCLUDED.bank,
       payment_method = EXCLUDED.payment_method,
       status = EXCLUDED.status,
       clickup_task_id = EXCLUDED.clickup_task_id,
       clickup_list_id = EXCLUDED.clickup_list_id,
       cost_center_code = EXCLUDED.cost_center_code,
       entry_type = EXCLUDED.entry_type,
       updated_at = NOW()
     RETURNING *`,
    [
      data.account_code,
      data.period,
      data.amount,
      data.description ?? null,
      data.client ?? null,
      data.project ?? null,
      data.bank ?? null,
      data.payment_method ?? null,
      data.status ?? null,
      data.source ?? "clickup",
      data.source_id ?? null,
      data.clickup_task_id ?? null,
      data.clickup_list_id ?? null,
      data.cost_center_code ?? null,
      data.entry_type ?? null,
    ]
  )
  return result.rows[0]!
}

export async function deleteEntryBySourceId(sourceId: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM dre_entries WHERE source_id = $1",
    [sourceId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function deleteEntryByClickupTaskId(taskId: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM dre_entries WHERE clickup_task_id = $1",
    [taskId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function getEntryByClickupTaskId(taskId: string): Promise<DbEntry | null> {
  const result = await pool.query<DbEntry>(
    "SELECT * FROM dre_entries WHERE clickup_task_id = $1 LIMIT 1",
    [taskId]
  )
  const row = result.rows[0]
  return row ?? null
}

export async function logWebhook(
  event: string,
  taskId: string | null,
  listId: string | null,
  payload: unknown,
  processed: boolean,
  error: string | null
): Promise<void> {
  await pool.query(
    "INSERT INTO webhook_log (event, task_id, list_id, payload, processed, error) VALUES ($1, $2, $3, $4, $5, $6)",
    [event, taskId, listId, JSON.stringify(payload), processed, error]
  )
}
