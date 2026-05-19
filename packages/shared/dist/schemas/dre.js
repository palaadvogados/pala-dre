import { z } from "zod";
export const DreNatureSchema = z.enum([
    "receita",
    "deducao",
    "custo",
    "despesa",
    "resultado",
]);
export const DreAccountSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    parentCode: z.string().nullable(),
    nature: DreNatureSchema,
    sign: z.number(),
    level: z.number(),
    isTotal: z.boolean(),
    orderIndex: z.number(),
});
export const DreRowSchema = z.object({
    code: z.string(),
    name: z.string(),
    level: z.number(),
    isTotal: z.boolean(),
    isBold: z.boolean().optional(),
    indentLevel: z.number().optional(),
    nature: z.string(),
    sign: z.number().optional(),
    lineType: z.enum(["account", "computed", "separator", "header"]).optional(),
    value: z.number(),
    valueComparative: z.number().optional(),
    avPercent: z.number().nullable(),
    avPercentComparative: z.number().nullable().optional(),
    ahPercent: z.number().nullable().optional(),
    budgetValue: z.number().optional(),
    budgetVariance: z.number().optional(),
    budgetVariancePercent: z.number().nullable().optional(),
    children: z.array(z.lazy(() => DreRowSchema)).optional(),
});
export const DreMultiPeriodRowSchema = z.object({
    code: z.string(),
    name: z.string(),
    level: z.number(),
    isTotal: z.boolean(),
    isBold: z.boolean().optional(),
    indentLevel: z.number().optional(),
    nature: z.string(),
    lineType: z.enum(["account", "computed", "separator", "header"]).optional(),
    values: z.record(z.string(), z.number()),
    avPercents: z.record(z.string(), z.number().nullable()),
});
export const DreResponseSchema = z.object({
    period: z.string().optional(),
    periodFrom: z.string().optional(),
    periodTo: z.string().optional(),
    comparative: z.string().optional(),
    rows: z.array(DreRowSchema),
    generatedAt: z.string(),
});
export const DreMultiPeriodResponseSchema = z.object({
    periodFrom: z.string(),
    periodTo: z.string(),
    periods: z.array(z.string()),
    rows: z.array(DreMultiPeriodRowSchema),
    generatedAt: z.string(),
});
export const DreDrillEntrySchema = z.object({
    id: z.number(),
    accountCode: z.string(),
    period: z.string(),
    amount: z.number(),
    description: z.string().nullable(),
    source: z.string(),
    createdAt: z.string(),
});
export const DreDrillResponseSchema = z.object({
    code: z.string(),
    name: z.string(),
    period: z.string(),
    total: z.number(),
    entries: z.array(DreDrillEntrySchema),
});
export const DreQuerySchema = z.object({
    period: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM").optional(),
    periodFrom: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM").optional(),
    periodTo: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM").optional(),
    comparative: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
        .optional(),
    categories: z.string().optional(),
    costCenter: z.string().optional(),
    analysisType: z.enum(["caixa", "competencia"]).optional(),
    showBudget: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    multiPeriod: z
        .string()
        .optional()
        .transform((v) => v === "true"),
}).refine((data) => data.period || (data.periodFrom && data.periodTo), "Either period or periodFrom+periodTo required");
export const DreCategorySchema = z.object({
    code: z.string(),
    name: z.string(),
    level: z.number().optional(),
    parentCode: z.string().optional(),
});
export const DreCategoriesResponseSchema = z.object({
    categories: z.array(DreCategorySchema),
});
export const DreCostCenterSchema = z.object({
    code: z.string(),
    name: z.string(),
    active: z.boolean(),
});
export const DreCostCentersResponseSchema = z.object({
    costCenters: z.array(DreCostCenterSchema),
});
export const DreReportLineSchema = z.object({
    code: z.string(),
    label: z.string(),
    lineType: z.enum(["account", "computed", "separator", "header"]),
    formula: z.string().nullable(),
    accountCode: z.string().nullable(),
    orderIndex: z.number(),
    isBold: z.boolean(),
    indentLevel: z.number(),
    nature: z.string().nullable(),
});
export const DreReportLinesResponseSchema = z.object({
    lines: z.array(DreReportLineSchema),
});
export const DreEvolutionPointSchema = z.object({
    period: z.string(),
    rl: z.number(),
    ebitda: z.number(),
    rliq: z.number(),
});
export const DreEvolutionResponseSchema = z.object({
    points: z.array(DreEvolutionPointSchema),
});
//# sourceMappingURL=dre.js.map