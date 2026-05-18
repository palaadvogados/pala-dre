"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatBRL, formatPercent } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { DreRow } from "@/types/dre"

interface DreKpiCardsProps {
  rows: DreRow[]
}

function findRow(rows: DreRow[], code: string): DreRow | undefined {
  for (const row of rows) {
    if (row.code === code) return row
    if (row.children) {
      const found = findRow(row.children, code)
      if (found) return found
    }
  }
  return undefined
}

function TrendUp() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  )
}

function TrendDown() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
    </svg>
  )
}

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  highlight?: "green" | "red" | "blue" | "neutral"
  showTrend?: boolean
}

function KpiCard({ label, value, sub, highlight = "neutral", showTrend = false }: KpiCardProps) {
  const borderColor = {
    green: "border-l-emerald-500",
    red: "border-l-red-500",
    blue: "border-l-blue-500",
    neutral: "border-l-border",
  }[highlight]

  const valueColor = {
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    neutral: "text-foreground",
  }[highlight]

  const trendColor = {
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    neutral: "text-muted-foreground",
  }[highlight]

  return (
    <Card className={cn("flex-1 border-l-2", borderColor)}>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {label}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className={cn("text-2xl font-semibold tabular-nums tracking-tight", valueColor)}>
            {value}
          </p>
          {showTrend && highlight !== "neutral" && (
            <span className={cn("mb-0.5", trendColor)}>
              {highlight === "green" || highlight === "blue" ? <TrendUp /> : <TrendDown />}
            </span>
          )}
        </div>
        {sub && (
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DreKpiCards({ rows }: DreKpiCardsProps) {
  const receitaLiquida = findRow(rows, "RL")
  const lucroBruto = findRow(rows, "LB")
  const ebitda = findRow(rows, "EBITDA")
  const resultadoLiquido = findRow(rows, "RLIQ")

  const rl = receitaLiquida?.value ?? 0
  const lb = lucroBruto?.value ?? 0
  const ebt = ebitda?.value ?? 0
  const liq = resultadoLiquido?.value ?? 0

  const margemBruta = rl !== 0 ? (lb / rl) * 100 : 0
  const margemLiquida = rl !== 0 ? (liq / rl) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        label="Receita Liquida"
        value={formatBRL(rl)}
        highlight="blue"
        showTrend
      />
      <KpiCard
        label="Margem Bruta"
        value={formatPercent(margemBruta)}
        sub={formatBRL(lb)}
        highlight={margemBruta >= 0 ? "green" : "red"}
        showTrend
      />
      <KpiCard
        label="EBITDA"
        value={formatBRL(ebt)}
        sub={rl !== 0 ? formatPercent((ebt / rl) * 100) + " da RL" : undefined}
        highlight={ebt >= 0 ? "green" : "red"}
        showTrend
      />
      <KpiCard
        label="Resultado Liquido"
        value={formatBRL(liq)}
        highlight={liq >= 0 ? "green" : "red"}
        showTrend
      />
      <KpiCard
        label="Margem Liquida"
        value={formatPercent(margemLiquida)}
        sub="sobre Receita Liquida"
        highlight={margemLiquida >= 0 ? "green" : "red"}
        showTrend
      />
    </div>
  )
}
