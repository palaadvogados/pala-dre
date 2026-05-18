import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value) + "%"
}

export function formatAH(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  const sign = value >= 0 ? "+" : ""
  return sign + formatPercent(value)
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function generatePeriods(): Array<{ value: string; label: string }> {
  const periods: Array<{ value: string; label: string }> = []
  for (const year of [2027, 2026]) {
    for (let m = 12; m >= 1; m--) {
      const value = `${year}-${String(m).padStart(2, "0")}`
      const label = `${MONTH_NAMES[m - 1]}/${year}`
      periods.push({ value, label })
    }
  }
  return periods
}

export const PERIOD_OPTIONS = generatePeriods()
