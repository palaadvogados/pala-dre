import type { DreDrillResponse, DreCategory, DreCostCenter, DreReportLine, DreEvolutionPoint } from "@pala-dre/shared";
export declare class DreService {
    private readonly logger;
    private readonly useMock;
    constructor();
    private loadAccounts;
    private loadLines;
    private loadEntriesRange;
    private loadEntriesSinglePeriod;
    private loadEntriesByAccount;
    getCategories(): Promise<{
        categories: DreCategory[];
    }>;
    getCostCentersData(): Promise<{
        costCenters: DreCostCenter[];
    }>;
    getReportLinesData(): Promise<{
        lines: DreReportLine[];
    }>;
    getDre(period: string | undefined, periodFrom: string | undefined, periodTo: string | undefined, comparative: string | undefined, categoriesParam: string | undefined, costCenterParam: string | undefined, analysisType: string | undefined, showBudget: boolean): Promise<{
        period: string | undefined;
        periodFrom: string | undefined;
        periodTo: string | undefined;
        comparative: string | undefined;
        rows: {
            value: number;
            code: string;
            name: string;
            nature: string;
            level: number;
            isTotal: boolean;
            avPercent: number | null;
            sign?: number | undefined;
            isBold?: boolean | undefined;
            indentLevel?: number | undefined;
            lineType?: "account" | "computed" | "separator" | "header" | undefined;
            valueComparative?: number | undefined;
            avPercentComparative?: number | null | undefined;
            ahPercent?: number | null | undefined;
            budgetValue?: number | undefined;
            budgetVariance?: number | undefined;
            budgetVariancePercent?: number | null | undefined;
            children?: any[] | undefined;
        }[];
        generatedAt: string;
    }>;
    getDreMultiPeriod(periodFrom: string, periodTo: string, costCenterParam: string | undefined, analysisType: string | undefined): Promise<{
        periodFrom: string;
        periodTo: string;
        periods: string[];
        rows: {
            values: Record<string, number>;
            code: string;
            name: string;
            nature: string;
            level: number;
            isTotal: boolean;
            avPercents: Record<string, number | null>;
            isBold?: boolean | undefined;
            indentLevel?: number | undefined;
            lineType?: "account" | "computed" | "separator" | "header" | undefined;
        }[];
        generatedAt: string;
    }>;
    getEvolution(months: number): Promise<{
        points: DreEvolutionPoint[];
    }>;
    getDreDrill(code: string, period: string): Promise<DreDrillResponse>;
    exportCsv(period: string | undefined, periodFrom: string | undefined, periodTo: string | undefined, costCenterParam: string | undefined, analysisType: string | undefined): Promise<string>;
    private computeLegacyValues;
    private buildLegacyRows;
    private getLegacyLines;
}
//# sourceMappingURL=dre.service.d.ts.map