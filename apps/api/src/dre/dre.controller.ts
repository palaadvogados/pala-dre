import { Controller, Get, Param, Query, HttpException, HttpStatus, Inject, Res } from "@nestjs/common"
import { DreService } from "./dre.service.js"
import { DreQuerySchema } from "@pala-dre/shared"

@Controller()
export class DreController {
  constructor(@Inject(DreService) private readonly dreService: DreService) {}

  @Get("health")
  health() {
    return {
      status: "ok",
      useMock: process.env["USE_MOCK"] !== "false",
      timestamp: new Date().toISOString(),
    }
  }

  @Get("dre/categories")
  async getCategories() {
    return this.dreService.getCategories()
  }

  @Get("dre/cost-centers")
  async getCostCenters() {
    return this.dreService.getCostCentersData()
  }

  @Get("dre/lines")
  async getReportLines() {
    return this.dreService.getReportLinesData()
  }

  @Get("dre/evolution")
  async getEvolution(@Query("months") monthsStr?: string) {
    const months = Math.min(Math.max(parseInt(monthsStr ?? "12", 10) || 12, 1), 24)
    return this.dreService.getEvolution(months)
  }

  @Get("dre/export")
  async exportDre(
    @Res() res: unknown,
    @Query("format") _format: string,
    @Query("period") period?: string,
    @Query("periodFrom") periodFrom?: string,
    @Query("periodTo") periodTo?: string,
    @Query("costCenter") costCenter?: string,
    @Query("analysisType") analysisType?: string,
  ) {
    if (!period && !(periodFrom && periodTo)) {
      throw new HttpException(
        { error: "period or periodFrom+periodTo required" },
        HttpStatus.BAD_REQUEST
      )
    }

    const csv = await this.dreService.exportCsv(period, periodFrom, periodTo, costCenter, analysisType)
    const filename = `dre-${period ?? `${periodFrom}_${periodTo}`}.csv`
    const r = res as {
      setHeader: (k: string, v: string) => void
      send: (body: string) => void
    }
    r.setHeader("Content-Type", "text/csv; charset=utf-8")
    r.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    r.send("﻿" + csv)
  }

  @Get("dre")
  async getDre(
    @Query("period") period?: string,
    @Query("periodFrom") periodFrom?: string,
    @Query("periodTo") periodTo?: string,
    @Query("comparative") comparative?: string,
    @Query("categories") categories?: string,
    @Query("costCenter") costCenter?: string,
    @Query("analysisType") analysisType?: string,
    @Query("showBudget") showBudget?: string,
    @Query("multiPeriod") multiPeriod?: string,
  ) {
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
    })

    if (!parsed.success) {
      throw new HttpException(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        HttpStatus.BAD_REQUEST
      )
    }

    const d = parsed.data

    if (d.multiPeriod && d.periodFrom && d.periodTo) {
      return this.dreService.getDreMultiPeriod(
        d.periodFrom,
        d.periodTo,
        d.costCenter,
        d.analysisType,
      )
    }

    return this.dreService.getDre(
      d.period,
      d.periodFrom,
      d.periodTo,
      d.comparative,
      d.categories,
      d.costCenter,
      d.analysisType,
      d.showBudget,
    )
  }

  @Get("dre/drill/:code")
  async getDreDrill(@Param("code") code: string, @Query("period") period: string) {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      throw new HttpException(
        { error: "period query param required (YYYY-MM)" },
        HttpStatus.BAD_REQUEST
      )
    }

    try {
      return await this.dreService.getDreDrill(code, period)
    } catch (err) {
      throw new HttpException({ error: String(err) }, HttpStatus.NOT_FOUND)
    }
  }
}
