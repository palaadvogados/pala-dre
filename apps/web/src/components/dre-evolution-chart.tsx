"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useDreEvolution } from "@/hooks/use-dre-data"
import { formatBRL } from "@/lib/utils"

const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function formatPeriodLabel(period: string): string {
  const [, mm] = period.split("-")
  const m = parseInt(mm ?? "1", 10)
  return MONTH_ABBR[m - 1] ?? period
}

function formatYAxis(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="tabular-nums font-medium text-foreground">{formatBRL(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function DreEvolutionChart() {
  const { data, isLoading, error } = useDreEvolution(12)

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="px-4 py-3 border-b bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Evolucao Mensal
          </p>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="h-6 w-6 rounded-full border-2 border-ring border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="px-4 py-3 border-b bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Evolucao Mensal
          </p>
        </div>
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          Dados indisponiveis
        </div>
      </div>
    )
  }

  const chartData = data.points.map((p) => ({
    period: formatPeriodLabel(p.period),
    "Receita Liquida": p.rl,
    EBITDA: p.ebitda,
    "Resultado Liquido": p.rliq,
  }))

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/20">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Evolucao Mensal (ultimos 12 meses)
        </p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEBITDA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRLIQ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
            <Area
              type="monotone"
              dataKey="Receita Liquida"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradRL)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="EBITDA"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradEBITDA)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="Resultado Liquido"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gradRLIQ)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
