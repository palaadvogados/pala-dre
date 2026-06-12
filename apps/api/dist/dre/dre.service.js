var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DreService_1;
import { Injectable, Logger } from "@nestjs/common";
import { ACCOUNTS as MOCK_ACCOUNTS, getEntriesForPeriod as mockGetEntriesForPeriod, getEntriesForAccount as mockGetEntriesForAccount, } from "../services/mock-data.js";
import { getAllAccounts, getEntriesByPeriodWithFilters, getEntriesByPeriodRange, getEntriesByAccount, getReportLines, getCostCenters, getBudgetByPeriodRange, } from "@pala-dre/db";
function dbAccountToAccount(row) {
    return {
        code: row.code,
        name: row.name,
        parentCode: row.parent_code,
        nature: row.nature,
        sign: row.sign,
        level: row.level,
        isTotal: row.is_total,
        orderIndex: row.order_index,
        categoryCode: row.category_code,
    };
}
function mockAccountToAccount(m) {
    return {
        code: m.code,
        name: m.name,
        parentCode: m.parentCode,
        nature: m.nature,
        sign: m.sign,
        level: m.level,
        isTotal: m.isTotal,
        orderIndex: m.orderIndex,
        categoryCode: m.categoryCode,
    };
}
function mockEntryToEntry(m) {
    return {
        id: m.id,
        accountCode: m.accountCode,
        period: m.period,
        amount: m.amount,
        description: m.description,
        source: "mock",
    };
}
function buildCategoryTree(accounts) {
    const result = [];
    for (const a of accounts) {
        const hasChildren = accounts.some((x) => x.parentCode === a.code);
        if (hasChildren) {
            result.push({
                code: a.code,
                name: a.name,
                level: a.level,
                parentCode: a.parentCode ?? undefined,
            });
        }
    }
    return result.sort((a, b) => {
        const aAcc = accounts.find((x) => x.code === a.code);
        const bAcc = accounts.find((x) => x.code === b.code);
        return (aAcc?.orderIndex ?? 0) - (bAcc?.orderIndex ?? 0);
    });
}
function sumDirectEntries(accountCode, entries, accounts, categories) {
    if (categories && categories.length > 0) {
        const visible = categories.some((cat) => accountCode === cat || accountCode.startsWith(cat + "."));
        if (!visible)
            return 0;
    }
    const account = accounts.find((a) => a.code === accountCode);
    const sign = account?.sign ?? 1;
    const raw = entries
        .filter((e) => e.accountCode === accountCode)
        .reduce((acc, e) => acc + e.amount, 0);
    return raw * sign;
}
function computeAccountValue(code, entries, accounts, valuesMap, categories) {
    if (valuesMap.has(code))
        return valuesMap.get(code);
    const account = accounts.find((a) => a.code === code);
    if (!account)
        return 0;
    const children = accounts.filter((a) => a.parentCode === code);
    let value;
    if (children.length === 0) {
        value = sumDirectEntries(code, entries, accounts, categories);
    }
    else {
        value = children.reduce((acc, child) => acc + computeAccountValue(child.code, entries, accounts, valuesMap, categories), 0);
    }
    valuesMap.set(code, value);
    return value;
}
function evaluateFormula(formula, valuesMap) {
    const sortedKeys = Array.from(valuesMap.keys()).sort((a, b) => b.length - a.length);
    let expr = formula;
    for (const key of sortedKeys) {
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const val = valuesMap.get(key) ?? 0;
        expr = expr.replace(new RegExp(`(?<![\\w.])${escaped}(?![\\w.])`, "g"), `(${val})`);
    }
    try {
        const result = Function(`"use strict"; return (${expr})`)();
        return isFinite(result) ? result : 0;
    }
    catch {
        return 0;
    }
}
function computeAllValues(lines, entries, accounts, categories) {
    const valuesMap = new Map();
    const accountValuesMap = new Map();
    for (const line of lines) {
        if (line.line_type === "account" && line.account_code) {
            computeAccountValue(line.account_code, entries, accounts, accountValuesMap, categories);
            valuesMap.set(line.code, accountValuesMap.get(line.account_code) ?? 0);
        }
    }
    for (const line of lines) {
        if (line.line_type === "computed" && line.formula) {
            const merged = new Map([...accountValuesMap, ...valuesMap]);
            const val = evaluateFormula(line.formula, merged);
            valuesMap.set(line.code, val);
        }
    }
    return valuesMap;
}
function buildRowsFromLines(lines, valuesMap, comparativeValuesMap, budgetMap, receitaLiquidaValue, comparativeRL) {
    const rows = [];
    for (const line of lines) {
        if (line.line_type === "separator") {
            rows.push({
                code: line.code,
                name: "",
                level: 0,
                isTotal: false,
                isBold: false,
                indentLevel: line.indent_level,
                nature: "resultado",
                lineType: "separator",
                value: 0,
                avPercent: null,
            });
            continue;
        }
        if (line.line_type === "header") {
            rows.push({
                code: line.code,
                name: line.label,
                level: line.indent_level,
                isTotal: true,
                isBold: true,
                indentLevel: line.indent_level,
                nature: line.nature ?? "resultado",
                lineType: "header",
                value: 0,
                avPercent: null,
            });
            continue;
        }
        const value = valuesMap.get(line.code) ?? 0;
        const compValue = comparativeValuesMap ? (comparativeValuesMap.get(line.code) ?? 0) : undefined;
        const budgetValue = budgetMap ? (budgetMap.get(line.code) ?? 0) : undefined;
        const avPercent = receitaLiquidaValue !== 0 ? (value / receitaLiquidaValue) * 100 : null;
        const avPercentComparative = compValue !== undefined && comparativeRL !== null && comparativeRL !== 0
            ? (compValue / comparativeRL) * 100
            : null;
        const ahPercent = compValue !== undefined && compValue !== 0
            ? ((value - compValue) / Math.abs(compValue)) * 100
            : null;
        const budgetVariance = budgetValue !== undefined ? value - budgetValue : undefined;
        const budgetVariancePercent = budgetValue !== undefined && budgetValue !== 0
            ? ((value - budgetValue) / Math.abs(budgetValue)) * 100
            : null;
        rows.push({
            code: line.code,
            name: line.label,
            level: line.indent_level,
            isTotal: line.is_bold,
            isBold: line.is_bold,
            indentLevel: line.indent_level,
            nature: line.nature ?? "resultado",
            lineType: line.line_type,
            value,
            valueComparative: compValue,
            avPercent,
            avPercentComparative,
            ahPercent,
            budgetValue,
            budgetVariance,
            budgetVariancePercent,
        });
    }
    return rows;
}
function buildBudgetMapFromLines(lines, budgetEntries, accounts) {
    const rawMap = new Map();
    for (const entry of budgetEntries) {
        rawMap.set(entry.account_code, (rawMap.get(entry.account_code) ?? 0) + parseFloat(entry.amount));
    }
    const budgetEntryLikes = Array.from(rawMap.entries()).map(([code, amount], idx) => ({
        id: idx,
        accountCode: code,
        period: "",
        amount,
        description: null,
        source: "budget",
    }));
    const accountValuesMap = new Map();
    const valuesMap = new Map();
    for (const line of lines) {
        if (line.line_type === "account" && line.account_code) {
            computeAccountValue(line.account_code, budgetEntryLikes, accounts, accountValuesMap, null);
            valuesMap.set(line.code, accountValuesMap.get(line.account_code) ?? 0);
        }
    }
    for (const line of lines) {
        if (line.line_type === "computed" && line.formula) {
            const merged = new Map([...accountValuesMap, ...valuesMap]);
            valuesMap.set(line.code, evaluateFormula(line.formula, merged));
        }
    }
    return valuesMap;
}
function generatePeriodList(periodFrom, periodTo) {
    const periods = [];
    const [fromYear, fromMonth] = periodFrom.split("-").map(Number);
    const [toYear, toMonth] = periodTo.split("-").map(Number);
    let y = fromYear;
    let m = fromMonth;
    while (y < toYear || (y === toYear && m <= toMonth)) {
        periods.push(`${y}-${String(m).padStart(2, "0")}`);
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    return periods;
}
let DreService = DreService_1 = class DreService {
    logger = new Logger(DreService_1.name);
    useMock;
    constructor() {
        this.useMock = process.env["USE_MOCK"] !== "false";
        this.logger.log(`DreService initialized (useMock=${this.useMock})`);
    }
    async loadAccounts() {
        if (this.useMock) {
            return MOCK_ACCOUNTS.map(mockAccountToAccount);
        }
        const rows = await getAllAccounts();
        return rows.map(dbAccountToAccount);
    }
    async loadLines() {
        if (this.useMock) {
            return [];
        }
        return getReportLines("padrao");
    }
    async loadEntriesRange(periodFrom, periodTo, costCenters, analysisType) {
        if (this.useMock) {
            const entries = [];
            const periods = generatePeriodList(periodFrom, periodTo);
            for (const p of periods) {
                entries.push(...mockGetEntriesForPeriod(p).map(mockEntryToEntry));
            }
            return entries;
        }
        const rows = await getEntriesByPeriodRange(periodFrom, periodTo, costCenters, analysisType);
        return rows.map((r) => ({
            id: r.id,
            accountCode: r.account_code,
            period: r.effective_period ?? r.period,
            amount: parseFloat(r.amount),
            description: r.description,
            source: r.source,
        }));
    }
    async loadEntriesSinglePeriod(period, costCenters, analysisType) {
        if (this.useMock) {
            return mockGetEntriesForPeriod(period).map(mockEntryToEntry);
        }
        const rows = await getEntriesByPeriodWithFilters(period, costCenters, analysisType);
        return rows.map((r) => ({
            id: r.id,
            accountCode: r.account_code,
            period: r.effective_period ?? r.period,
            amount: parseFloat(r.amount),
            description: r.description,
            source: r.source,
        }));
    }
    async loadEntriesByAccount(code, period) {
        if (this.useMock) {
            return mockGetEntriesForAccount(code, period).map(mockEntryToEntry);
        }
        const rows = await getEntriesByAccount(code, period);
        return rows.map((r) => ({
            id: r.id,
            accountCode: r.account_code,
            period,
            amount: parseFloat(r.amount),
            description: r.description,
            source: r.source,
        }));
    }
    async getCategories() {
        const accounts = await this.loadAccounts();
        return { categories: buildCategoryTree(accounts) };
    }
    async getCostCentersData() {
        if (this.useMock) {
            return { costCenters: [] };
        }
        const rows = await getCostCenters();
        return {
            costCenters: rows.map((r) => ({
                code: r.code,
                name: r.name,
                active: r.active,
            })),
        };
    }
    async getReportLinesData() {
        const lines = await this.loadLines();
        return {
            lines: lines.map((l) => ({
                code: l.code,
                label: l.label,
                lineType: l.line_type,
                formula: l.formula,
                accountCode: l.account_code,
                orderIndex: l.order_index,
                isBold: l.is_bold,
                indentLevel: l.indent_level,
                nature: l.nature,
            })),
        };
    }
    async getDre(period, periodFrom, periodTo, comparative, categoriesParam, costCenterParam, analysisType, showBudget) {
        const resolvedFrom = periodFrom ?? period;
        const resolvedTo = periodTo ?? period;
        const categories = categoriesParam && categoriesParam.trim().length > 0
            ? categoriesParam.split(",").map((c) => c.trim()).filter(Boolean)
            : null;
        const costCenters = costCenterParam && costCenterParam.trim().length > 0
            ? costCenterParam.split(",").map((c) => c.trim()).filter(Boolean)
            : null;
        const accounts = await this.loadAccounts();
        const lines = await this.loadLines();
        const entries = await this.loadEntriesRange(resolvedFrom, resolvedTo, costCenters, analysisType ?? null);
        let valuesMap;
        if (lines.length > 0) {
            valuesMap = computeAllValues(lines, entries, accounts, categories);
        }
        else {
            valuesMap = this.computeLegacyValues(entries, accounts, categories);
        }
        let comparativeValuesMap = null;
        if (comparative) {
            const compEntries = await this.loadEntriesSinglePeriod(comparative, costCenters, analysisType ?? null);
            if (lines.length > 0) {
                comparativeValuesMap = computeAllValues(lines, compEntries, accounts, categories);
            }
            else {
                comparativeValuesMap = this.computeLegacyValues(compEntries, accounts, categories);
            }
        }
        let budgetMap = null;
        if (showBudget && lines.length > 0) {
            const budgetEntries = await getBudgetByPeriodRange(resolvedFrom, resolvedTo, costCenters);
            budgetMap = buildBudgetMapFromLines(lines, budgetEntries, accounts);
        }
        const receitaLiquidaValue = valuesMap.get("RL") ?? 0;
        const comparativeRL = comparativeValuesMap ? (comparativeValuesMap.get("RL") ?? 0) : null;
        let rows;
        if (lines.length > 0) {
            rows = buildRowsFromLines(lines, valuesMap, comparativeValuesMap, budgetMap, receitaLiquidaValue, comparativeRL);
        }
        else {
            rows = this.buildLegacyRows(accounts, valuesMap, comparativeValuesMap, receitaLiquidaValue);
        }
        return {
            period: period ?? undefined,
            periodFrom: periodFrom ?? undefined,
            periodTo: periodTo ?? undefined,
            comparative,
            rows,
            generatedAt: new Date().toISOString(),
        };
    }
    async getDreMultiPeriod(periodFrom, periodTo, costCenterParam, analysisType) {
        const costCenters = costCenterParam && costCenterParam.trim().length > 0
            ? costCenterParam.split(",").map((c) => c.trim()).filter(Boolean)
            : null;
        const periods = generatePeriodList(periodFrom, periodTo);
        const accounts = await this.loadAccounts();
        const lines = await this.loadLines();
        const periodValuesMaps = new Map();
        for (const p of periods) {
            const entries = await this.loadEntriesSinglePeriod(p, costCenters, analysisType ?? null);
            const vm = lines.length > 0
                ? computeAllValues(lines, entries, accounts, null)
                : this.computeLegacyValues(entries, accounts, null);
            periodValuesMaps.set(p, vm);
        }
        const rows = [];
        const displayLines = lines.length > 0 ? lines : this.getLegacyLines(accounts);
        for (const line of displayLines) {
            const values = {};
            const avPercents = {};
            for (const p of periods) {
                const vm = periodValuesMaps.get(p);
                const v = vm.get(line.code) ?? 0;
                const rl = vm.get("RL") ?? 0;
                values[p] = v;
                avPercents[p] = rl !== 0 ? (v / rl) * 100 : null;
            }
            rows.push({
                code: line.code,
                name: line.label ?? line.code,
                level: line.indent_level ?? 0,
                isTotal: line.is_bold ?? false,
                isBold: line.is_bold ?? false,
                indentLevel: line.indent_level ?? 0,
                nature: line.nature ?? "resultado",
                lineType: line.line_type,
                values,
                avPercents,
            });
        }
        return {
            periodFrom,
            periodTo,
            periods,
            rows,
            generatedAt: new Date().toISOString(),
        };
    }
    async getEvolution(months) {
        const now = new Date();
        const points = [];
        const accounts = await this.loadAccounts();
        const lines = await this.loadLines();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const entries = await this.loadEntriesSinglePeriod(p, null, null);
            const vm = lines.length > 0
                ? computeAllValues(lines, entries, accounts, null)
                : this.computeLegacyValues(entries, accounts, null);
            points.push({
                period: p,
                rl: vm.get("RL") ?? 0,
                ebitda: vm.get("EBITDA") ?? 0,
                rliq: vm.get("RLIQ") ?? 0,
            });
        }
        return { points };
    }
    async getDreDrill(code, period) {
        const accounts = await this.loadAccounts();
        const account = accounts.find((a) => a.code === code);
        if (!account)
            throw new Error(`Account ${code} not found`);
        const entries = await this.loadEntriesByAccount(code, period);
        const total = entries.reduce((acc, e) => acc + e.amount, 0);
        return {
            code,
            name: account.name,
            period,
            total,
            entries: entries.map((e) => ({
                id: e.id,
                accountCode: e.accountCode,
                period: e.period,
                amount: e.amount,
                description: e.description,
                source: e.source,
                createdAt: new Date().toISOString(),
            })),
        };
    }
    async exportCsv(period, periodFrom, periodTo, costCenterParam, analysisType) {
        const result = await this.getDre(period, periodFrom, periodTo, undefined, undefined, costCenterParam, analysisType, false);
        const lines = [
            ["Codigo", "Descricao", "Valor (R$)", "AV%"].join(";"),
        ];
        for (const row of result.rows) {
            if (row.lineType === "separator") {
                lines.push(";;;;");
                continue;
            }
            const av = row.avPercent !== null && row.avPercent !== undefined
                ? row.avPercent.toFixed(1).replace(".", ",") + "%"
                : "-";
            lines.push([
                `"${row.code}"`,
                `"${row.name}"`,
                row.value.toFixed(2).replace(".", ","),
                av,
            ].join(";"));
        }
        return lines.join("\r\n");
    }
    computeLegacyValues(entries, accounts, categories) {
        const COMPUTED_CODES = new Set(["RL", "LB", "EBITDA", "RAIRC", "RLIQ"]);
        const valuesMap = new Map();
        function computeValue(code) {
            if (valuesMap.has(code))
                return valuesMap.get(code);
            if (COMPUTED_CODES.has(code)) {
                let result = 0;
                if (code === "RL") {
                    result = computeValue("1");
                }
                else if (code === "LB") {
                    result = computeValue("RL") + computeValue("2");
                }
                else if (code === "EBITDA") {
                    const lb = computeValue("LB");
                    const despTotal = computeValue("3");
                    const despFin = computeValue("3.4");
                    const deprec = computeValue("3.5");
                    result = lb + despTotal - despFin - deprec;
                }
                else if (code === "RAIRC") {
                    result = computeValue("LB") + computeValue("3");
                }
                else if (code === "RLIQ") {
                    result = computeValue("RAIRC");
                }
                valuesMap.set(code, result);
                return result;
            }
            const account = accounts.find((a) => a.code === code);
            if (!account)
                return 0;
            const children = accounts.filter((a) => a.parentCode === code);
            let value;
            if (children.length === 0) {
                value = sumDirectEntries(code, entries, accounts, categories);
            }
            else {
                value = children.reduce((acc, child) => acc + computeValue(child.code), 0);
            }
            valuesMap.set(code, value);
            return value;
        }
        const allCodes = [...accounts.map((a) => a.code), ...COMPUTED_CODES];
        allCodes.forEach((code) => computeValue(code));
        return valuesMap;
    }
    buildLegacyRows(accounts, valuesMap, comparativeValuesMap, receitaLiquidaValue) {
        const displayOrder = ["1", "RL", "2", "LB", "3", "EBITDA", "RAIRC", "RLIQ"];
        const buildRow = (code) => {
            const account = accounts.find((a) => a.code === code);
            if (!account) {
                return {
                    code,
                    name: code,
                    level: 0,
                    isTotal: true,
                    nature: "resultado",
                    sign: 1,
                    value: 0,
                    avPercent: null,
                };
            }
            const value = valuesMap.get(code) ?? 0;
            const compValue = comparativeValuesMap ? (comparativeValuesMap.get(code) ?? 0) : undefined;
            const compRL = comparativeValuesMap ? (comparativeValuesMap.get("RL") ?? 0) : undefined;
            const avPercent = receitaLiquidaValue !== 0 ? (value / receitaLiquidaValue) * 100 : null;
            const avPercentComparative = compValue !== undefined && compRL !== undefined && compRL !== 0
                ? (compValue / compRL) * 100
                : null;
            const ahPercent = compValue !== undefined && compValue !== 0
                ? ((value - compValue) / Math.abs(compValue)) * 100
                : null;
            const children = accounts
                .filter((a) => a.parentCode === code)
                .sort((a, b) => a.orderIndex - b.orderIndex);
            return {
                code: account.code,
                name: account.name,
                level: account.level,
                isTotal: account.isTotal,
                nature: account.nature,
                sign: account.sign,
                value,
                valueComparative: compValue,
                avPercent,
                avPercentComparative,
                ahPercent,
                children: children.length > 0 ? children.map((c) => buildRow(c.code)) : undefined,
            };
        };
        return displayOrder.map((code) => buildRow(code));
    }
    getLegacyLines(accounts) {
        const displayOrder = ["1", "RL", "2", "LB", "3", "EBITDA", "RAIRC", "RLIQ"];
        return displayOrder.map((code, idx) => {
            const account = accounts.find((a) => a.code === code);
            return {
                id: idx,
                code,
                label: account?.name ?? code,
                line_type: "account",
                formula: null,
                account_code: account ? code : null,
                parent_id: null,
                order_index: idx * 10,
                is_bold: account?.isTotal ?? true,
                indent_level: account?.level ?? 0,
                nature: account?.nature ?? "resultado",
                visible: true,
                report_id: "padrao",
            };
        });
    }
};
DreService = DreService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], DreService);
export { DreService };
//# sourceMappingURL=dre.service.js.map