export interface DbAccount {
    code: string;
    name: string;
    parent_code: string | null;
    nature: string;
    sign: number;
    level: number;
    is_total: boolean;
    order_index: number;
    category_code: string | null;
    clickup_option_index: number | null;
}
export interface DbEntry {
    id: number;
    account_code: string;
    period: string;
    amount: string;
    description: string | null;
    client: string | null;
    project: string | null;
    bank: string | null;
    payment_method: string | null;
    status: string | null;
    source: string;
    source_id: string | null;
    clickup_task_id: string | null;
    clickup_list_id: string | null;
    cost_center_code: string | null;
    entry_type: string | null;
    period_caixa: string | null;
    effective_period?: string;
    created_at: string;
    updated_at: string;
}
export interface DbReportLine {
    id: number;
    code: string;
    label: string;
    line_type: "account" | "computed" | "separator" | "header";
    formula: string | null;
    account_code: string | null;
    parent_id: number | null;
    order_index: number;
    is_bold: boolean;
    indent_level: number;
    nature: string | null;
    visible: boolean;
    report_id: string;
}
export interface DbCostCenter {
    id: number;
    code: string;
    name: string;
    active: boolean;
}
export interface DbBudgetEntry {
    account_code: string;
    period: string;
    amount: string;
    cost_center_code: string | null;
}
export declare function getAllAccounts(): Promise<DbAccount[]>;
export declare function getEntriesByPeriod(period: string): Promise<DbEntry[]>;
export declare function getEntriesByPeriodRange(periodFrom: string, periodTo: string, costCenters?: string[] | null, analysisType?: string | null): Promise<DbEntry[]>;
export declare function getEntriesByPeriodWithFilters(period: string, costCenters?: string[] | null, analysisType?: string | null): Promise<DbEntry[]>;
export declare function getEntriesByAccount(code: string, period: string): Promise<DbEntry[]>;
export declare function getReportLines(reportId?: string): Promise<DbReportLine[]>;
export declare function getCostCenters(): Promise<DbCostCenter[]>;
export declare function getBudgetByPeriodRange(periodFrom: string, periodTo: string, costCenters?: string[] | null): Promise<DbBudgetEntry[]>;
export interface UpsertEntryData {
    account_code: string;
    period: string;
    amount: number;
    description?: string | null;
    client?: string | null;
    project?: string | null;
    bank?: string | null;
    payment_method?: string | null;
    status?: string | null;
    source?: string;
    source_id?: string | null;
    clickup_task_id?: string | null;
    clickup_list_id?: string | null;
    cost_center_code?: string | null;
    entry_type?: string | null;
    period_caixa?: string | null;
}
export declare function upsertEntry(data: UpsertEntryData): Promise<DbEntry>;
export declare function deleteEntryBySourceId(sourceId: string): Promise<boolean>;
export declare function deleteEntryByClickupTaskId(taskId: string): Promise<boolean>;
export declare function getEntryByClickupTaskId(taskId: string): Promise<DbEntry | null>;
export declare function logWebhook(event: string, taskId: string | null, listId: string | null, payload: unknown, processed: boolean, error: string | null): Promise<void>;
//# sourceMappingURL=dre.d.ts.map