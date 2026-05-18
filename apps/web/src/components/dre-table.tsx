"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBRL, formatPercent, formatAH, cn } from "@/lib/utils"
import type { DreRow } from "@/types/dre"

interface DreTableProps {
  rows: DreRow[]
  hasComparative: boolean
  periodLabel: string
  comparativeLabel?: string
  nivel: number
  hasActiveFilter?: boolean
  showBudget?: boolean
  onDrillDown?: (code: string) => void
}

const KEY_CODES = new Set(["RL", "LB", "EBITDA", "RAIRC", "RLIQ"])

function flattenRows(rows: DreRow[], maxLevel: number): DreRow[] {
  const result: DreRow[] = []
  for (const row of rows) {
    result.push(row)
    if (row.lineType === "separator" || row.lineType === "header") continue
    const level = row.indentLevel ?? row.level
    if (row.children && row.children.length > 0 && level < maxLevel - 1) {
      result.push(...flattenRows(row.children, maxLevel))
    }
  }
  return result
}

interface DreRowComponentProps {
  row: DreRow
  hasComparative: boolean
  showBudget?: boolean
  onDrillDown?: (code: string) => void
}

function DreRowComponent({ row, hasComparative, showBudget, onDrillDown }: DreRowComponentProps) {
  if (row.lineType === "separator") {
    const colCount = 4 + (hasComparative ? 3 : 0) + (showBudget ? 3 : 0)
    return (
      <TableRow className="h-2 pointer-events-none">
        <TableCell colSpan={colCount} className="py-0 bg-muted/10" />
      </TableRow>
    )
  }

  const isKey = KEY_CODES.has(row.code)
  const isEbitda = row.code === "EBITDA"
  const isResultadoLiquido = row.code === "RLIQ"
  const isBold = row.isBold ?? row.isTotal
  const indentLevel = row.indentLevel ?? row.level

  const rowBg = cn(
    isResultadoLiquido && row.value >= 0 && "border-l-2 border-l-emerald-500 bg-emerald-500/5",
    isResultadoLiquido && row.value < 0 && "border-l-2 border-l-red-500 bg-red-500/5",
    isEbitda && "border-l-2 border-l-blue-500 bg-blue-500/5",
    isKey && !isEbitda && !isResultadoLiquido && "border-l-2 border-l-muted-foreground/40 bg-muted/30",
    !isKey && isBold && indentLevel === 0 && "bg-muted/20",
    !isKey && isBold && indentLevel === 1 && "bg-muted/10"
  )

  const nameClass = cn(
    "text-left text-sm",
    isKey ? "font-bold text-foreground uppercase" : isBold ? "font-semibold text-foreground" : "text-muted-foreground font-normal"
  )

  const valueColor = (val: number) =>
    val > 0 ? "text-emerald-600 dark:text-emerald-400" : val < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"

  const ahColor = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "text-muted-foreground"
    return val >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
  }

  const canDrill = !isBold && !isKey && onDrillDown && row.lineType !== "header"

  return (
    <TableRow className={cn(rowBg, "hover:bg-muted/50 transition-colors")}>
      <TableCell className="tabular-nums text-muted-foreground text-xs w-[100px] font-mono">
        {row.code}
      </TableCell>

      <TableCell className={cn("min-w-[300px]", nameClass)}>
        <span
          style={{ paddingLeft: `${indentLevel * 20}px` }}
          className={cn(canDrill && "cursor-pointer hover:text-blue-400 hover:underline underline-offset-2")}
          onClick={() => { if (canDrill) onDrillDown!(row.code) }}
        >
          {row.name}
        </span>
      </TableCell>

      <TableCell
        className={cn(
          "text-right tabular-nums min-w-[140px] text-sm",
          isKey ? "font-bold " + valueColor(row.value) : valueColor(row.value)
        )}
      >
        {formatBRL(row.value)}
      </TableCell>

      <TableCell className="text-right tabular-nums text-muted-foreground min-w-[70px] text-sm">
        {formatPercent(row.avPercent)}
      </TableCell>

      {hasComparative && (
        <>
          <TableCell className={cn("text-right tabular-nums min-w-[140px] text-sm", valueColor(row.valueComparative ?? 0))}>
            {row.valueComparative !== undefined ? formatBRL(row.valueComparative) : "-"}
          </TableCell>
          <TableCell className="text-right tabular-nums text-muted-foreground min-w-[70px] text-sm">
            {formatPercent(row.avPercentComparative)}
          </TableCell>
          <TableCell className={cn("text-right tabular-nums min-w-[70px] text-sm", ahColor(row.ahPercent))}>
            {formatAH(row.ahPercent)}
          </TableCell>
        </>
      )}

      {showBudget && (
        <>
          <TableCell className={cn("text-right tabular-nums min-w-[140px] text-sm", valueColor(row.budgetValue ?? 0))}>
            {row.budgetValue !== undefined ? formatBRL(row.budgetValue) : "-"}
          </TableCell>
          <TableCell className={cn("text-right tabular-nums min-w-[140px] text-sm", valueColor(row.budgetVariance ?? 0))}>
            {row.budgetVariance !== undefined ? formatBRL(row.budgetVariance) : "-"}
          </TableCell>
          <TableCell className={cn("text-right tabular-nums min-w-[70px] text-sm", ahColor(row.budgetVariancePercent))}>
            {row.budgetVariancePercent !== undefined ? formatAH(row.budgetVariancePercent) : "-"}
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

export function DreTable({
  rows,
  hasComparative,
  periodLabel,
  comparativeLabel,
  nivel,
  hasActiveFilter,
  showBudget,
  onDrillDown,
}: DreTableProps) {
  const flatRows = useMemo(() => {
    const all = flattenRows(rows, nivel)
    if (!hasActiveFilter) return all
    return all.filter((r) => {
      if (r.lineType === "separator") return true
      if (r.lineType === "header") return true
      if (KEY_CODES.has(r.code)) return true
      if ((r.isBold ?? r.isTotal) && (r.indentLevel ?? r.level) === 0) return true
      return r.value !== 0 || (r.valueComparative !== undefined && r.valueComparative !== 0)
    })
  }, [rows, nivel, hasActiveFilter])

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Nivel {nivel}
          </span>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {flatRows.filter((r) => r.lineType !== "separator").length} linhas
          </span>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Clique nas linhas de detalhe para ver lancamentos
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/10 hover:bg-muted/10">
            <TableHead className="w-[100px]">Codigo</TableHead>
            <TableHead className="min-w-[300px]">Grupo de Natureza</TableHead>
            <TableHead className="text-right min-w-[140px]">{periodLabel}</TableHead>
            <TableHead className="text-right min-w-[70px]">%</TableHead>
            {hasComparative && (
              <>
                <TableHead className="text-right min-w-[140px]">{comparativeLabel ?? "Comparativo"}</TableHead>
                <TableHead className="text-right min-w-[70px]">%</TableHead>
                <TableHead className="text-right min-w-[70px]">AH%</TableHead>
              </>
            )}
            {showBudget && (
              <>
                <TableHead className="text-right min-w-[140px]">Orcado</TableHead>
                <TableHead className="text-right min-w-[140px]">Variacao</TableHead>
                <TableHead className="text-right min-w-[70px]">Var%</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {flatRows.map((row, idx) => (
            <DreRowComponent
              key={`${row.code}-${idx}`}
              row={row}
              hasComparative={hasComparative}
              showBudget={showBudget}
              onDrillDown={onDrillDown}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
