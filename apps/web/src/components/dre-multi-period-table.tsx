"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBRL, formatPercent, cn } from "@/lib/utils"
import type { DreMultiPeriodRow } from "@/types/dre"

const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function formatPeriodCol(period: string): string {
  const [y, mm] = period.split("-")
  const m = parseInt(mm ?? "1", 10)
  return `${MONTH_ABBR[m - 1]}/${(y ?? "").slice(2)}`
}

const KEY_CODES = new Set(["RL", "LB", "EBITDA", "RAIRC", "RLIQ"])

interface DreMultiPeriodTableProps {
  rows: DreMultiPeriodRow[]
  periods: string[]
}

export function DreMultiPeriodTable({ rows, periods }: DreMultiPeriodTableProps) {
  const valueColor = (val: number) =>
    val > 0 ? "text-emerald-600 dark:text-emerald-400" : val < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Multi-Periodo
          </span>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {periods.length} meses
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 hover:bg-muted/10">
              <TableHead className="w-[100px] sticky left-0 bg-card z-10">Codigo</TableHead>
              <TableHead className="min-w-[240px] sticky left-[100px] bg-card z-10">Descricao</TableHead>
              {periods.map((p) => (
                <TableHead key={p} className="text-right min-w-[120px]">{formatPeriodCol(p)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              if (row.lineType === "separator") {
                return (
                  <TableRow key={row.code} className="h-2 pointer-events-none">
                    <TableCell colSpan={2 + periods.length} className="py-0 bg-muted/10" />
                  </TableRow>
                )
              }

              const isKey = KEY_CODES.has(row.code)
              const rowBg = cn(
                row.code === "RLIQ" && "border-l-2 border-l-emerald-500 bg-emerald-500/5",
                row.code === "EBITDA" && "border-l-2 border-l-blue-500 bg-blue-500/5",
                isKey && row.code !== "RLIQ" && row.code !== "EBITDA" && "border-l-2 border-l-muted-foreground/40 bg-muted/30",
                !isKey && row.isTotal && "bg-muted/20"
              )

              const nameClass = cn(
                "text-sm",
                isKey ? "font-bold text-foreground uppercase" : row.isTotal ? "font-semibold text-foreground" : "text-muted-foreground font-normal"
              )

              return (
                <TableRow key={row.code} className={cn(rowBg, "hover:bg-muted/50 transition-colors")}>
                  <TableCell className="tabular-nums text-muted-foreground text-xs font-mono w-[100px] sticky left-0 bg-inherit">
                    {row.code}
                  </TableCell>
                  <TableCell className={cn("min-w-[240px] sticky left-[100px] bg-inherit", nameClass)}>
                    <span style={{ paddingLeft: `${(row.indentLevel ?? 0) * 16}px` }}>{row.name}</span>
                  </TableCell>
                  {periods.map((p) => {
                    const v = row.values[p] ?? 0
                    return (
                      <TableCell
                        key={p}
                        className={cn(
                          "text-right tabular-nums text-sm min-w-[120px]",
                          isKey ? "font-bold " + valueColor(v) : valueColor(v)
                        )}
                      >
                        {formatBRL(v)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
