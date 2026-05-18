"use client"

import useSWR from "swr"
import {
  fetchDre,
  fetchDreDrill,
  fetchDreCategories,
  fetchDreCostCenters,
  fetchDreEvolution,
  fetchDreMultiPeriod,
  type FetchDreOptions,
} from "@/lib/api"
import type {
  DreResponse,
  DreMultiPeriodResponse,
  DreDrillResponse,
  DreCategoriesResponse,
  DreCostCentersResponse,
  DreEvolutionResponse,
} from "@/types/dre"

export function useDreData(options: FetchDreOptions) {
  const key = JSON.stringify(options)
  return useSWR<DreResponse>(
    `dre-${key}`,
    () => fetchDre(options),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
}

export function useDreMultiPeriod(
  periodFrom: string,
  periodTo: string,
  costCenter?: string[],
  analysisType?: "caixa" | "competencia",
  enabled = true
) {
  const ccKey = costCenter?.join(",") ?? ""
  const key = enabled ? `dre-multi-${periodFrom}-${periodTo}-${ccKey}-${analysisType ?? ""}` : null
  return useSWR<DreMultiPeriodResponse>(
    key,
    () => fetchDreMultiPeriod(periodFrom, periodTo, costCenter, analysisType),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
}

export function useDreDrill(code: string | null, period: string) {
  return useSWR<DreDrillResponse>(
    code ? `drill-${code}-${period}` : null,
    () => fetchDreDrill(code!, period),
    {
      revalidateOnFocus: false,
    }
  )
}

export function useDreCategories() {
  return useSWR<DreCategoriesResponse>(
    "dre-categories",
    fetchDreCategories,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000,
    }
  )
}

export function useDreCostCenters() {
  return useSWR<DreCostCentersResponse>(
    "dre-cost-centers",
    fetchDreCostCenters,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000,
    }
  )
}

export function useDreEvolution(months = 12) {
  return useSWR<DreEvolutionResponse>(
    `dre-evolution-${months}`,
    () => fetchDreEvolution(months),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
}
