import { z } from "zod";
export declare const DreNatureSchema: z.ZodEnum<["receita", "deducao", "custo", "despesa", "resultado"]>;
export type DreNature = z.infer<typeof DreNatureSchema>;
export declare const DreAccountSchema: z.ZodObject<{
    id: z.ZodNumber;
    code: z.ZodString;
    name: z.ZodString;
    parentCode: z.ZodNullable<z.ZodString>;
    nature: z.ZodEnum<["receita", "deducao", "custo", "despesa", "resultado"]>;
    sign: z.ZodNumber;
    level: z.ZodNumber;
    isTotal: z.ZodBoolean;
    orderIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: number;
    name: string;
    parentCode: string | null;
    nature: "receita" | "deducao" | "custo" | "despesa" | "resultado";
    sign: number;
    level: number;
    isTotal: boolean;
    orderIndex: number;
}, {
    code: string;
    id: number;
    name: string;
    parentCode: string | null;
    nature: "receita" | "deducao" | "custo" | "despesa" | "resultado";
    sign: number;
    level: number;
    isTotal: boolean;
    orderIndex: number;
}>;
export type DreAccount = z.infer<typeof DreAccountSchema>;
export declare const DreRowSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    level: z.ZodNumber;
    isTotal: z.ZodBoolean;
    isBold: z.ZodOptional<z.ZodBoolean>;
    indentLevel: z.ZodOptional<z.ZodNumber>;
    nature: z.ZodString;
    sign: z.ZodOptional<z.ZodNumber>;
    lineType: z.ZodOptional<z.ZodEnum<["account", "computed", "separator", "header"]>>;
    value: z.ZodNumber;
    valueComparative: z.ZodOptional<z.ZodNumber>;
    avPercent: z.ZodNullable<z.ZodNumber>;
    avPercentComparative: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ahPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    budgetValue: z.ZodOptional<z.ZodNumber>;
    budgetVariance: z.ZodOptional<z.ZodNumber>;
    budgetVariancePercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    children: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodTypeAny>, "many">>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export type DreRow = z.infer<typeof DreRowSchema>;
export declare const DreMultiPeriodRowSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    level: z.ZodNumber;
    isTotal: z.ZodBoolean;
    isBold: z.ZodOptional<z.ZodBoolean>;
    indentLevel: z.ZodOptional<z.ZodNumber>;
    nature: z.ZodString;
    lineType: z.ZodOptional<z.ZodEnum<["account", "computed", "separator", "header"]>>;
    values: z.ZodRecord<z.ZodString, z.ZodNumber>;
    avPercents: z.ZodRecord<z.ZodString, z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export type DreMultiPeriodRow = z.infer<typeof DreMultiPeriodRowSchema>;
export declare const DreResponseSchema: z.ZodObject<{
    period: z.ZodOptional<z.ZodString>;
    periodFrom: z.ZodOptional<z.ZodString>;
    periodTo: z.ZodOptional<z.ZodString>;
    comparative: z.ZodOptional<z.ZodString>;
    rows: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        level: z.ZodNumber;
        isTotal: z.ZodBoolean;
        isBold: z.ZodOptional<z.ZodBoolean>;
        indentLevel: z.ZodOptional<z.ZodNumber>;
        nature: z.ZodString;
        sign: z.ZodOptional<z.ZodNumber>;
        lineType: z.ZodOptional<z.ZodEnum<["account", "computed", "separator", "header"]>>;
        value: z.ZodNumber;
        valueComparative: z.ZodOptional<z.ZodNumber>;
        avPercent: z.ZodNullable<z.ZodNumber>;
        avPercentComparative: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        ahPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        budgetValue: z.ZodOptional<z.ZodNumber>;
        budgetVariance: z.ZodOptional<z.ZodNumber>;
        budgetVariancePercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        children: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodTypeAny>, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
    period?: string | undefined;
    periodFrom?: string | undefined;
    periodTo?: string | undefined;
    comparative?: string | undefined;
}, {
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
    period?: string | undefined;
    periodFrom?: string | undefined;
    periodTo?: string | undefined;
    comparative?: string | undefined;
}>;
export type DreResponse = z.infer<typeof DreResponseSchema>;
export declare const DreMultiPeriodResponseSchema: z.ZodObject<{
    periodFrom: z.ZodString;
    periodTo: z.ZodString;
    periods: z.ZodArray<z.ZodString, "many">;
    rows: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        level: z.ZodNumber;
        isTotal: z.ZodBoolean;
        isBold: z.ZodOptional<z.ZodBoolean>;
        indentLevel: z.ZodOptional<z.ZodNumber>;
        nature: z.ZodString;
        lineType: z.ZodOptional<z.ZodEnum<["account", "computed", "separator", "header"]>>;
        values: z.ZodRecord<z.ZodString, z.ZodNumber>;
        avPercents: z.ZodRecord<z.ZodString, z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    periodFrom: string;
    periodTo: string;
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
    periods: string[];
}, {
    periodFrom: string;
    periodTo: string;
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
    periods: string[];
}>;
export type DreMultiPeriodResponse = z.infer<typeof DreMultiPeriodResponseSchema>;
export declare const DreDrillEntrySchema: z.ZodObject<{
    id: z.ZodNumber;
    accountCode: z.ZodString;
    period: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodNullable<z.ZodString>;
    source: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    period: string;
    accountCode: string;
    amount: number;
    description: string | null;
    source: string;
    createdAt: string;
}, {
    id: number;
    period: string;
    accountCode: string;
    amount: number;
    description: string | null;
    source: string;
    createdAt: string;
}>;
export type DreDrillEntry = z.infer<typeof DreDrillEntrySchema>;
export declare const DreDrillResponseSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    period: z.ZodString;
    total: z.ZodNumber;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        accountCode: z.ZodString;
        period: z.ZodString;
        amount: z.ZodNumber;
        description: z.ZodNullable<z.ZodString>;
        source: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        period: string;
        accountCode: string;
        amount: number;
        description: string | null;
        source: string;
        createdAt: string;
    }, {
        id: number;
        period: string;
        accountCode: string;
        amount: number;
        description: string | null;
        source: string;
        createdAt: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
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
}, {
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
export type DreDrillResponse = z.infer<typeof DreDrillResponseSchema>;
export declare const DreQuerySchema: z.ZodEffects<z.ZodObject<{
    period: z.ZodOptional<z.ZodString>;
    periodFrom: z.ZodOptional<z.ZodString>;
    periodTo: z.ZodOptional<z.ZodString>;
    comparative: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodString>;
    costCenter: z.ZodOptional<z.ZodString>;
    analysisType: z.ZodOptional<z.ZodEnum<["caixa", "competencia"]>>;
    showBudget: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean, string | undefined>;
    multiPeriod: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean, string | undefined>;
}, "strip", z.ZodTypeAny, {
    showBudget: boolean;
    multiPeriod: boolean;
    period?: string | undefined;
    periodFrom?: string | undefined;
    periodTo?: string | undefined;
    comparative?: string | undefined;
    categories?: string | undefined;
    costCenter?: string | undefined;
    analysisType?: "caixa" | "competencia" | undefined;
}, {
    period?: string | undefined;
    periodFrom?: string | undefined;
    periodTo?: string | undefined;
    comparative?: string | undefined;
    categories?: string | undefined;
    costCenter?: string | undefined;
    analysisType?: "caixa" | "competencia" | undefined;
    showBudget?: string | undefined;
    multiPeriod?: string | undefined;
}>, {
    showBudget: boolean;
    multiPeriod: boolean;
    period?: string | undefined;
    periodFrom?: string | undefined;
    periodTo?: string | undefined;
    comparative?: string | undefined;
    categories?: string | undefined;
    costCenter?: string | undefined;
    analysisType?: "caixa" | "competencia" | undefined;
}, {
    period?: string | undefined;
    periodFrom?: string | undefined;
    periodTo?: string | undefined;
    comparative?: string | undefined;
    categories?: string | undefined;
    costCenter?: string | undefined;
    analysisType?: "caixa" | "competencia" | undefined;
    showBudget?: string | undefined;
    multiPeriod?: string | undefined;
}>;
export type DreQuery = z.infer<typeof DreQuerySchema>;
export declare const DreCategorySchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    level: z.ZodOptional<z.ZodNumber>;
    parentCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    parentCode?: string | undefined;
    level?: number | undefined;
}, {
    code: string;
    name: string;
    parentCode?: string | undefined;
    level?: number | undefined;
}>;
export type DreCategory = z.infer<typeof DreCategorySchema>;
export declare const DreCategoriesResponseSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        level: z.ZodOptional<z.ZodNumber>;
        parentCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        name: string;
        parentCode?: string | undefined;
        level?: number | undefined;
    }, {
        code: string;
        name: string;
        parentCode?: string | undefined;
        level?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    categories: {
        code: string;
        name: string;
        parentCode?: string | undefined;
        level?: number | undefined;
    }[];
}, {
    categories: {
        code: string;
        name: string;
        parentCode?: string | undefined;
        level?: number | undefined;
    }[];
}>;
export type DreCategoriesResponse = z.infer<typeof DreCategoriesResponseSchema>;
export declare const DreCostCenterSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    active: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    active: boolean;
}, {
    code: string;
    name: string;
    active: boolean;
}>;
export type DreCostCenter = z.infer<typeof DreCostCenterSchema>;
export declare const DreCostCentersResponseSchema: z.ZodObject<{
    costCenters: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        active: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: string;
        name: string;
        active: boolean;
    }, {
        code: string;
        name: string;
        active: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    costCenters: {
        code: string;
        name: string;
        active: boolean;
    }[];
}, {
    costCenters: {
        code: string;
        name: string;
        active: boolean;
    }[];
}>;
export type DreCostCentersResponse = z.infer<typeof DreCostCentersResponseSchema>;
export declare const DreReportLineSchema: z.ZodObject<{
    code: z.ZodString;
    label: z.ZodString;
    lineType: z.ZodEnum<["account", "computed", "separator", "header"]>;
    formula: z.ZodNullable<z.ZodString>;
    accountCode: z.ZodNullable<z.ZodString>;
    orderIndex: z.ZodNumber;
    isBold: z.ZodBoolean;
    indentLevel: z.ZodNumber;
    nature: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    nature: string | null;
    orderIndex: number;
    isBold: boolean;
    indentLevel: number;
    lineType: "account" | "computed" | "separator" | "header";
    accountCode: string | null;
    label: string;
    formula: string | null;
}, {
    code: string;
    nature: string | null;
    orderIndex: number;
    isBold: boolean;
    indentLevel: number;
    lineType: "account" | "computed" | "separator" | "header";
    accountCode: string | null;
    label: string;
    formula: string | null;
}>;
export type DreReportLine = z.infer<typeof DreReportLineSchema>;
export declare const DreReportLinesResponseSchema: z.ZodObject<{
    lines: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        label: z.ZodString;
        lineType: z.ZodEnum<["account", "computed", "separator", "header"]>;
        formula: z.ZodNullable<z.ZodString>;
        accountCode: z.ZodNullable<z.ZodString>;
        orderIndex: z.ZodNumber;
        isBold: z.ZodBoolean;
        indentLevel: z.ZodNumber;
        nature: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nature: string | null;
        orderIndex: number;
        isBold: boolean;
        indentLevel: number;
        lineType: "account" | "computed" | "separator" | "header";
        accountCode: string | null;
        label: string;
        formula: string | null;
    }, {
        code: string;
        nature: string | null;
        orderIndex: number;
        isBold: boolean;
        indentLevel: number;
        lineType: "account" | "computed" | "separator" | "header";
        accountCode: string | null;
        label: string;
        formula: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    lines: {
        code: string;
        nature: string | null;
        orderIndex: number;
        isBold: boolean;
        indentLevel: number;
        lineType: "account" | "computed" | "separator" | "header";
        accountCode: string | null;
        label: string;
        formula: string | null;
    }[];
}, {
    lines: {
        code: string;
        nature: string | null;
        orderIndex: number;
        isBold: boolean;
        indentLevel: number;
        lineType: "account" | "computed" | "separator" | "header";
        accountCode: string | null;
        label: string;
        formula: string | null;
    }[];
}>;
export type DreReportLinesResponse = z.infer<typeof DreReportLinesResponseSchema>;
export declare const DreEvolutionPointSchema: z.ZodObject<{
    period: z.ZodString;
    rl: z.ZodNumber;
    ebitda: z.ZodNumber;
    rliq: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    period: string;
    rl: number;
    ebitda: number;
    rliq: number;
}, {
    period: string;
    rl: number;
    ebitda: number;
    rliq: number;
}>;
export type DreEvolutionPoint = z.infer<typeof DreEvolutionPointSchema>;
export declare const DreEvolutionResponseSchema: z.ZodObject<{
    points: z.ZodArray<z.ZodObject<{
        period: z.ZodString;
        rl: z.ZodNumber;
        ebitda: z.ZodNumber;
        rliq: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        period: string;
        rl: number;
        ebitda: number;
        rliq: number;
    }, {
        period: string;
        rl: number;
        ebitda: number;
        rliq: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    points: {
        period: string;
        rl: number;
        ebitda: number;
        rliq: number;
    }[];
}, {
    points: {
        period: string;
        rl: number;
        ebitda: number;
        rliq: number;
    }[];
}>;
export type DreEvolutionResponse = z.infer<typeof DreEvolutionResponseSchema>;
//# sourceMappingURL=dre.d.ts.map