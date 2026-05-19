var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Param, Query, HttpException, HttpStatus, Inject, Res } from "@nestjs/common";
import { DreService } from "./dre.service.js";
import { DreQuerySchema } from "@pala-dre/shared";
let DreController = class DreController {
    dreService;
    constructor(dreService) {
        this.dreService = dreService;
    }
    health() {
        return {
            status: "ok",
            useMock: process.env["USE_MOCK"] !== "false",
            timestamp: new Date().toISOString(),
        };
    }
    async getCategories() {
        return this.dreService.getCategories();
    }
    async getCostCenters() {
        return this.dreService.getCostCentersData();
    }
    async getReportLines() {
        return this.dreService.getReportLinesData();
    }
    async getEvolution(monthsStr) {
        const months = Math.min(Math.max(parseInt(monthsStr ?? "12", 10) || 12, 1), 24);
        return this.dreService.getEvolution(months);
    }
    async exportDre(res, _format, period, periodFrom, periodTo, costCenter, analysisType) {
        if (!period && !(periodFrom && periodTo)) {
            throw new HttpException({ error: "period or periodFrom+periodTo required" }, HttpStatus.BAD_REQUEST);
        }
        const csv = await this.dreService.exportCsv(period, periodFrom, periodTo, costCenter, analysisType);
        const filename = `dre-${period ?? `${periodFrom}_${periodTo}`}.csv`;
        const r = res;
        r.setHeader("Content-Type", "text/csv; charset=utf-8");
        r.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        r.send("﻿" + csv);
    }
    async getDre(period, periodFrom, periodTo, comparative, categories, costCenter, analysisType, showBudget, multiPeriod) {
        const parsed = DreQuerySchema.safeParse({
            period,
            periodFrom,
            periodTo,
            comparative,
            categories,
            costCenter,
            analysisType,
            showBudget,
            multiPeriod,
        });
        if (!parsed.success) {
            throw new HttpException({ error: "Invalid query parameters", details: parsed.error.flatten() }, HttpStatus.BAD_REQUEST);
        }
        const d = parsed.data;
        if (d.multiPeriod && d.periodFrom && d.periodTo) {
            return this.dreService.getDreMultiPeriod(d.periodFrom, d.periodTo, d.costCenter, d.analysisType);
        }
        return this.dreService.getDre(d.period, d.periodFrom, d.periodTo, d.comparative, d.categories, d.costCenter, d.analysisType, d.showBudget);
    }
    async getDreDrill(code, period) {
        if (!period || !/^\d{4}-\d{2}$/.test(period)) {
            throw new HttpException({ error: "period query param required (YYYY-MM)" }, HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.dreService.getDreDrill(code, period);
        }
        catch (err) {
            throw new HttpException({ error: String(err) }, HttpStatus.NOT_FOUND);
        }
    }
};
__decorate([
    Get("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DreController.prototype, "health", null);
__decorate([
    Get("dre/categories"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DreController.prototype, "getCategories", null);
__decorate([
    Get("dre/cost-centers"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DreController.prototype, "getCostCenters", null);
__decorate([
    Get("dre/lines"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DreController.prototype, "getReportLines", null);
__decorate([
    Get("dre/evolution"),
    __param(0, Query("months")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DreController.prototype, "getEvolution", null);
__decorate([
    Get("dre/export"),
    __param(0, Res()),
    __param(1, Query("format")),
    __param(2, Query("period")),
    __param(3, Query("periodFrom")),
    __param(4, Query("periodTo")),
    __param(5, Query("costCenter")),
    __param(6, Query("analysisType")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DreController.prototype, "exportDre", null);
__decorate([
    Get("dre"),
    __param(0, Query("period")),
    __param(1, Query("periodFrom")),
    __param(2, Query("periodTo")),
    __param(3, Query("comparative")),
    __param(4, Query("categories")),
    __param(5, Query("costCenter")),
    __param(6, Query("analysisType")),
    __param(7, Query("showBudget")),
    __param(8, Query("multiPeriod")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DreController.prototype, "getDre", null);
__decorate([
    Get("dre/drill/:code"),
    __param(0, Param("code")),
    __param(1, Query("period")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DreController.prototype, "getDreDrill", null);
DreController = __decorate([
    Controller(),
    __param(0, Inject(DreService)),
    __metadata("design:paramtypes", [DreService])
], DreController);
export { DreController };
//# sourceMappingURL=dre.controller.js.map