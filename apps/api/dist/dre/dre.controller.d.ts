import { DreService } from "./dre.service.js";
export declare class DreController {
    private readonly dreService;
    constructor(dreService: DreService);
    health(): {
        status: string;
        useMock: boolean;
        timestamp: string;
    };
    getCategories(): Promise<{
        categories: import("@pala-dre/shared").DreCategory[];
    }>;
    getCostCenters(): Promise<{
        costCenters: import("@pala-dre/shared").DreCostCenter[];
    }>;
    getReportLines(): Promise<{
        lines: import("@pala-dre/shared").DreReportLine[];
    }>;
    getEvolution(monthsStr?: string): Promise<{
        points: import("@pala-dre/shared").DreEvolutionPoint[];
    }>;
    exportDre(res: unknown, _format: string, period?: string, periodFrom?: string, periodTo?: string, costCenter?: string, analysisType?: string): Promise<void>;
    getDre(period?: string, periodFrom?: string, periodTo?: string, comparative?: string, categories?: string, costCenter?: string, analysisType?: string, showBudget?: string, multiPeriod?: string): Promise<{
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
    } | {
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
    getDreDrill(code: string, period: string): Promise<{
        entries: {
            id: number;
            period: string;
            accountCode: string;
            amount: number;
            description: string | null;
            source: string;
            createdAt: string;
        }[];
        code: string;
        name: string;
        period: string;
        total: number;
    }>;
}
//# sourceMappingURL=dre.controller.d.ts.map