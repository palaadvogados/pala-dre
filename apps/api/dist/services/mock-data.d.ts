export interface MockAccount {
    code: string;
    name: string;
    parentCode: string | null;
    nature: "receita" | "deducao" | "custo" | "despesa" | "resultado" | "ativo" | "passivo";
    sign: number;
    level: number;
    isTotal: boolean;
    orderIndex: number;
    categoryCode?: string;
}
export interface MockEntry {
    id: number;
    accountCode: string;
    period: string;
    amount: number;
    description: string;
}
export declare const ACCOUNTS: MockAccount[];
export declare const ENTRIES: MockEntry[];
export declare const AVAILABLE_PERIODS: string[];
export declare function getEntriesForPeriod(period: string): MockEntry[];
export declare function getEntriesForAccount(code: string, period: string): MockEntry[];
//# sourceMappingURL=mock-data.d.ts.map