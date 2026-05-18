"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useDreData, useDreCategories, useDreCostCenters, useDreMultiPeriod } from "@/hooks/use-dre-data"
import { DreTable } from "@/components/dre-table"
import { DreKpiCards } from "@/components/dre-kpi-cards"
import { DreFilters } from "@/components/dre-filters"
import { DreDrillModal } from "@/components/dre-drill-modal"
import { DreEvolutionChart } from "@/components/dre-evolution-chart"
import { DreMultiPeriodTable } from "@/components/dre-multi-period-table"
import { PERIOD_OPTIONS } from "@/lib/utils"
import { buildExportUrl } from "@/lib/api"

function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-8 w-8" />
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label="Alternar tema"
    >
      {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("2026-05")
  const [periodFrom, setPeriodFrom] = useState("2026-01")
  const [periodTo, setPeriodTo] = useState("2026-05")
  const [comparative, setComparative] = useState("")
  const [viewMode, setViewMode] = useState<"mensal" | "acumulado" | "multi-periodo">("mensal")
  const [nivel, setNivel] = useState(3)
  const [drillCode, setDrillCode] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [costCenters, setCostCenters] = useState<string[]>([])
  const [analysisType, setAnalysisType] = useState<"caixa" | "competencia">("caixa")
  const [showBudget, setShowBudget] = useState(false)

  const { data: categoriesData } = useDreCategories()
  const { data: costCentersData } = useDreCostCenters()

  const isRange = viewMode === "acumulado"
  const isMulti = viewMode === "multi-periodo"

  const dreOptions = isRange
    ? {
        periodFrom,
        periodTo,
        comparative: comparative || undefined,
        categories: categories.length > 0 ? categories : undefined,
        costCenter: costCenters.length > 0 ? costCenters : undefined,
        analysisType,
        showBudget,
      }
    : {
        period,
        comparative: comparative || undefined,
        categories: categories.length > 0 ? categories : undefined,
        costCenter: costCenters.length > 0 ? costCenters : undefined,
        analysisType,
        showBudget,
      }

  const { data, isLoading, error } = useDreData(isMulti ? { period: "2026-01" } : dreOptions)
  const { data: multiData, isLoading: multiLoading, error: multiError } = useDreMultiPeriod(
    periodFrom,
    periodTo,
    costCenters.length > 0 ? costCenters : undefined,
    analysisType,
    isMulti
  )

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period
  const comparativeLabel = PERIOD_OPTIONS.find((o) => o.value === comparative)?.label
  const exportUrl = buildExportUrl(
    isRange ? undefined : period,
    isRange ? periodFrom : undefined,
    isRange ? periodTo : undefined,
    costCenters.length > 0 ? costCenters : undefined,
    analysisType
  )

  const showMainDre = !isMulti
  const showMultiDre = isMulti

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                DRE - Pala Advogados
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Demonstrativo de Resultado do Exercicio
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <DreFilters
              period={period}
              periodFrom={periodFrom}
              periodTo={periodTo}
              comparative={comparative}
              viewMode={viewMode}
              nivel={nivel}
              categories={categories}
              availableCategories={categoriesData?.categories ?? []}
              costCenters={costCenters}
              availableCostCenters={costCentersData?.costCenters ?? []}
              analysisType={analysisType}
              showBudget={showBudget}
              onPeriodChange={setPeriod}
              onPeriodFromChange={setPeriodFrom}
              onPeriodToChange={setPeriodTo}
              onComparativeChange={setComparative}
              onViewModeChange={setViewMode}
              onNivelChange={setNivel}
              onCategoriesChange={setCategories}
              onCostCentersChange={setCostCenters}
              onAnalysisTypeChange={setAnalysisType}
              onShowBudgetChange={setShowBudget}
            />
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <DownloadIcon />
              CSV
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-6 space-y-6">
        {showMainDre && (
          <>
            {isLoading && (
              <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 rounded-full border-2 border-ring border-t-transparent animate-spin" />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-6 py-4 text-destructive text-sm">
                Erro ao carregar DRE: {String(error)}
              </div>
            )}

            {data && (
              <>
                <section>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    Indicadores do Periodo
                  </p>
                  <DreKpiCards rows={data.rows} />
                </section>

                <section>
                  <DreEvolutionChart />
                </section>

                <section>
                  <div className="mb-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Demonstrativo Completo
                    </p>
                  </div>
                  <DreTable
                    rows={data.rows}
                    hasComparative={!!comparative}
                    periodLabel={isRange ? `${periodFrom} a ${periodTo}` : periodLabel}
                    comparativeLabel={comparativeLabel}
                    nivel={nivel}
                    hasActiveFilter={categories.length > 0 || costCenters.length > 0}
                    showBudget={showBudget}
                    onDrillDown={setDrillCode}
                  />
                </section>
              </>
            )}
          </>
        )}

        {showMultiDre && (
          <>
            {multiLoading && (
              <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 rounded-full border-2 border-ring border-t-transparent animate-spin" />
              </div>
            )}
            {multiError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-6 py-4 text-destructive text-sm">
                Erro ao carregar DRE multi-periodo: {String(multiError)}
              </div>
            )}
            {multiData && (
              <section>
                <div className="mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Demonstrativo Multi-Periodo
                  </p>
                </div>
                <DreMultiPeriodTable rows={multiData.rows} periods={multiData.periods} />
              </section>
            )}
          </>
        )}
      </main>

      {drillCode && (
        <DreDrillModal
          code={drillCode}
          period={period}
          onClose={() => setDrillCode(null)}
        />
      )}
    </div>
  )
}
