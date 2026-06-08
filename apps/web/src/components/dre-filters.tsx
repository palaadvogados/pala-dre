"use client"

import { useRef, useState, useEffect } from "react"
import { Select } from "@/components/ui/select"
import { PERIOD_OPTIONS } from "@/lib/utils"
import type { DreCategory, DreCostCenter } from "@/types/dre"

interface DreFiltersProps {
  period: string
  periodFrom: string
  periodTo: string
  comparative: string
  viewMode: "mensal" | "acumulado" | "multi-periodo"
  nivel: number
  categories: string[]
  availableCategories: DreCategory[]
  costCenters: string[]
  availableCostCenters: DreCostCenter[]
  analysisType: "caixa" | "competencia"
  onPeriodChange: (value: string) => void
  onPeriodFromChange: (value: string) => void
  onPeriodToChange: (value: string) => void
  onComparativeChange: (value: string) => void
  onViewModeChange: (value: "mensal" | "acumulado" | "multi-periodo") => void
  onNivelChange: (value: number) => void
  onCategoriesChange: (value: string[]) => void
  onCostCentersChange: (value: string[]) => void
  onAnalysisTypeChange: (value: "caixa" | "competencia") => void
}

const COMPARATIVE_OPTIONS = [
  { value: "", label: "Sem comparativo" },
  ...PERIOD_OPTIONS,
]

const VIEW_MODE_OPTIONS = [
  { value: "mensal", label: "Mensal" },
  { value: "acumulado", label: "Acumulado" },
  { value: "multi-periodo", label: "Multi-Periodo" },
]

const NIVEL_OPTIONS = [
  { value: "1", label: "Nivel 1" },
  { value: "2", label: "Nivel 2" },
  { value: "3", label: "Nivel 3" },
]

const ANALYSIS_TYPE_OPTIONS = [
  { value: "caixa", label: "Caixa" },
  { value: "competencia", label: "Competencia" },
]

function CategoryTreeNode({
  cat,
  children,
  allCats,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
}: {
  cat: DreCategory
  children: DreCategory[]
  allCats: DreCategory[]
  selected: string[]
  expanded: Set<string>
  onToggleSelect: (code: string) => void
  onToggleExpand: (code: string) => void
}) {
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(cat.code)
  const isSelected = selected.includes(cat.code)
  const isParentSelected = selected.some((s) => cat.code.startsWith(s + ".") && s !== cat.code)
  const indent = (cat.level ?? 0) * 16

  return (
    <>
      <div
        className="flex items-center gap-1.5 px-2 py-1 hover:bg-accent cursor-pointer"
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-muted shrink-0"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(cat.code) }}
          >
            <svg
              className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}
        <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-input accent-primary shrink-0"
            checked={isSelected || isParentSelected}
            disabled={isParentSelected}
            onChange={() => onToggleSelect(cat.code)}
          />
          <span className="text-[10px] text-muted-foreground w-10 shrink-0 font-mono">{cat.code}</span>
          <span className="text-xs truncate">{cat.name}</span>
        </label>
      </div>
      {hasChildren && isExpanded && children.map((child) => (
        <CategoryTreeNode
          key={child.code}
          cat={child}
          children={allCats.filter((c) => c.parentCode === child.code)}
          allCats={allCats}
          selected={selected}
          expanded={expanded}
          onToggleSelect={onToggleSelect}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  )
}

function CategoryMultiSelect({
  selected,
  options,
  onChange,
}: {
  selected: string[]
  options: DreCategory[]
  onChange: (value: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["1", "2", "3"]))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function toggleSelect(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code && !c.startsWith(code + ".")))
    } else {
      const cleaned = selected.filter((c) => !c.startsWith(code + ".") && !code.startsWith(c + "."))
      onChange([...cleaned, code])
    }
  }

  function toggleExpand(code: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const topLevel = options.filter((o) => !o.parentCode || !options.some((p) => p.code === o.parentCode))

  const label =
    selected.length === 0
      ? "Plano de Contas"
      : selected.length === 1
        ? options.find((o) => o.code === selected[0])?.name ?? selected[0]
        : `${selected.length} filtros`

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground">Plano de Contas</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 min-w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <span className="truncate text-xs">{label}</span>
          {selected.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {selected.length}
            </span>
          )}
          <svg className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full right-0 z-50 mt-1 w-[380px] max-h-[420px] overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-3 py-2 sticky top-0 bg-popover z-10">
              <span className="text-xs font-medium text-foreground">Filtrar por conta</span>
              {selected.length > 0 && (
                <button type="button" onClick={() => onChange([])} className="text-xs text-muted-foreground hover:text-destructive">
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="py-1">
              {topLevel.map((cat) => (
                <CategoryTreeNode
                  key={cat.code}
                  cat={cat}
                  children={options.filter((c) => c.parentCode === cat.code)}
                  allCats={options}
                  selected={selected}
                  expanded={expanded}
                  onToggleSelect={toggleSelect}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CostCenterMultiSelect({
  selected,
  options,
  onChange,
}: {
  selected: string[]
  options: DreCostCenter[]
  onChange: (value: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function toggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code))
    } else {
      onChange([...selected, code])
    }
  }

  const label =
    selected.length === 0
      ? "Todos os CRs"
      : selected.length === 1
        ? options.find((o) => o.code === selected[0])?.name ?? selected[0]
        : `${selected.length} CRs`

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground">Centro de Resultado</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 min-w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <span className="truncate text-xs">{label}</span>
          {selected.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {selected.length}
            </span>
          )}
          <svg className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full right-0 z-50 mt-1 w-[260px] rounded-md border border-border bg-popover shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-3 py-2 sticky top-0 bg-popover z-10">
              <span className="text-xs font-medium text-foreground">Centro de Resultado</span>
              {selected.length > 0 && (
                <button type="button" onClick={() => onChange([])} className="text-xs text-muted-foreground hover:text-destructive">
                  Limpar
                </button>
              )}
            </div>
            <div className="py-1">
              {options.map((cc) => (
                <div
                  key={cc.code}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent cursor-pointer"
                  onClick={() => toggle(cc.code)}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-input accent-primary shrink-0"
                    checked={selected.includes(cc.code)}
                    readOnly
                  />
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0 font-mono">{cc.code}</span>
                  <span className="text-xs truncate">{cc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function DreFilters({
  period,
  periodFrom,
  periodTo,
  comparative,
  viewMode,
  nivel,
  categories,
  availableCategories,
  costCenters,
  availableCostCenters,
  analysisType,
  onPeriodChange,
  onPeriodFromChange,
  onPeriodToChange,
  onComparativeChange,
  onViewModeChange,
  onNivelChange,
  onCategoriesChange,
  onCostCentersChange,
  onAnalysisTypeChange,
}: DreFiltersProps) {
  const isRange = viewMode === "acumulado" || viewMode === "multi-periodo"
  const isMulti = viewMode === "multi-periodo"

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        id="viewMode"
        label="Visualizacao"
        value={viewMode}
        options={VIEW_MODE_OPTIONS}
        onChange={(e) => onViewModeChange(e.target.value as "mensal" | "acumulado" | "multi-periodo")}
        className="min-w-[130px]"
      />

      {!isRange ? (
        <Select
          id="period"
          label="Periodo"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="min-w-[130px]"
        />
      ) : (
        <>
          <Select
            id="periodFrom"
            label="De"
            value={periodFrom}
            options={PERIOD_OPTIONS}
            onChange={(e) => onPeriodFromChange(e.target.value)}
            className="min-w-[130px]"
          />
          <Select
            id="periodTo"
            label="Ate"
            value={periodTo}
            options={PERIOD_OPTIONS}
            onChange={(e) => onPeriodToChange(e.target.value)}
            className="min-w-[130px]"
          />
        </>
      )}

      {!isMulti && (
        <Select
          id="comparative"
          label="Comparativo"
          value={comparative}
          options={COMPARATIVE_OPTIONS}
          onChange={(e) => onComparativeChange(e.target.value)}
          className="min-w-[160px]"
        />
      )}

      <Select
        id="analysisType"
        label="Tipo de Analise"
        value={analysisType}
        options={ANALYSIS_TYPE_OPTIONS}
        onChange={(e) => onAnalysisTypeChange(e.target.value as "caixa" | "competencia")}
        className="min-w-[130px]"
      />

      {!isMulti && (
        <Select
          id="nivel"
          label="Nivel"
          value={String(nivel)}
          options={NIVEL_OPTIONS}
          onChange={(e) => onNivelChange(Number(e.target.value))}
          className="min-w-[110px]"
        />
      )}

      {availableCostCenters.length > 0 && (
        <CostCenterMultiSelect
          selected={costCenters}
          options={availableCostCenters}
          onChange={onCostCentersChange}
        />
      )}

      {availableCategories.length > 0 && !isMulti && (
        <CategoryMultiSelect
          selected={categories}
          options={availableCategories}
          onChange={onCategoriesChange}
        />
      )}
    </div>
  )
}
