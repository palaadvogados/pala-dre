import { pool } from "../pool.js";
export async function getAllAccounts() {
    const result = await pool.query("SELECT code, name, parent_code, nature, sign, level, is_total, order_index, category_code, clickup_option_index FROM dre_accounts ORDER BY order_index");
    return result.rows;
}
export async function getEntriesByPeriod(period) {
    const periodDate = period + "-01";
    const result = await pool.query("SELECT * FROM dre_entries WHERE DATE_TRUNC('month', period) = DATE_TRUNC('month', $1::date) ORDER BY created_at", [periodDate]);
    return result.rows;
}
export async function getEntriesByPeriodRange(periodFrom, periodTo, costCenters, analysisType) {
    const fromDate = periodFrom + "-01";
    const toDate = periodTo + "-01";
    // Regime caixa filtra pela data da baixa (period_caixa); competência pelo vencimento (period).
    // periodCol é controlado internamente (não vem do usuário) — sem risco de injection.
    const periodCol = analysisType === "caixa" ? "period_caixa" : "period";
    const params = [fromDate, toDate];
    // No regime caixa, linhas sem period_caixa (não pagas) caem fora do range automaticamente,
    // pois DATE_TRUNC(NULL) é NULL e a comparação vira falsa.
    let sql = `SELECT *, ${periodCol} AS effective_period FROM dre_entries WHERE DATE_TRUNC('month', ${periodCol}) >= DATE_TRUNC('month', $1::date) AND DATE_TRUNC('month', ${periodCol}) <= DATE_TRUNC('month', $2::date)`;
    if (costCenters && costCenters.length > 0) {
        params.push(costCenters);
        sql += ` AND cost_center_code = ANY($${params.length}::text[])`;
    }
    sql += " ORDER BY created_at";
    const result = await pool.query(sql, params);
    return result.rows;
}
export async function getEntriesByPeriodWithFilters(period, costCenters, analysisType) {
    return getEntriesByPeriodRange(period, period, costCenters, analysisType);
}
export async function getEntriesByAccount(code, period) {
    const periodDate = period + "-01";
    const result = await pool.query("SELECT * FROM dre_entries WHERE account_code = $1 AND DATE_TRUNC('month', period) = DATE_TRUNC('month', $2::date) ORDER BY created_at", [code, periodDate]);
    return result.rows;
}
export async function getReportLines(reportId = "padrao") {
    const result = await pool.query("SELECT id, code, label, line_type, formula, account_code, parent_id, order_index, is_bold, indent_level, nature, visible, report_id FROM dre_report_lines WHERE report_id = $1 AND visible = true ORDER BY order_index", [reportId]);
    return result.rows;
}
export async function getCostCenters() {
    const result = await pool.query("SELECT id, code, name, active FROM dre_cost_centers WHERE active = true ORDER BY code");
    return result.rows;
}
export async function getBudgetByPeriodRange(periodFrom, periodTo, costCenters) {
    const fromDate = periodFrom + "-01";
    const toDate = periodTo + "-01";
    const params = [fromDate, toDate];
    let sql = `
    SELECT account_code, TO_CHAR(period, 'YYYY-MM') as period, SUM(amount)::text as amount, cost_center_code
    FROM dre_budget
    WHERE DATE_TRUNC('month', period) >= DATE_TRUNC('month', $1::date)
      AND DATE_TRUNC('month', period) <= DATE_TRUNC('month', $2::date)
  `;
    if (costCenters && costCenters.length > 0) {
        params.push(costCenters);
        sql += ` AND cost_center_code = ANY($${params.length}::text[])`;
    }
    sql += " GROUP BY account_code, period, cost_center_code";
    const result = await pool.query(sql, params);
    return result.rows;
}
export async function upsertEntry(data) {
    const result = await pool.query(`INSERT INTO dre_entries (account_code, period, amount, description, client, project, bank, payment_method, status, source, source_id, clickup_task_id, clickup_list_id, cost_center_code, entry_type, period_caixa, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
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
       period_caixa = EXCLUDED.period_caixa,
       updated_at = NOW()
     RETURNING *`, [
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
        data.period_caixa ?? null,
    ]);
    return result.rows[0];
}
export async function deleteEntryBySourceId(sourceId) {
    const result = await pool.query("DELETE FROM dre_entries WHERE source_id = $1", [sourceId]);
    return (result.rowCount ?? 0) > 0;
}
export async function deleteEntryByClickupTaskId(taskId) {
    const result = await pool.query("DELETE FROM dre_entries WHERE clickup_task_id = $1", [taskId]);
    return (result.rowCount ?? 0) > 0;
}
export async function getEntryByClickupTaskId(taskId) {
    const result = await pool.query("SELECT * FROM dre_entries WHERE clickup_task_id = $1 LIMIT 1", [taskId]);
    const row = result.rows[0];
    return row ?? null;
}
export async function logWebhook(event, taskId, listId, payload, processed, error) {
    await pool.query("INSERT INTO webhook_log (event, task_id, list_id, payload, processed, error) VALUES ($1, $2, $3, $4, $5, $6)", [event, taskId, listId, JSON.stringify(payload), processed, error]);
}
//# sourceMappingURL=dre.js.map