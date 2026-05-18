import type {
  DreResponse,
  DreMultiPeriodResponse,
  DreDrillResponse,
  DreCategoriesResponse,
  DreCostCentersResponse,
  DreEvolutionResponse,
} from "@pala-dre/shared"

const BASE = process.env["NEXT_PUBLIC_API_URL"] ?? ""

export interface FetchDreOptions {
  period?: string
  periodFrom?: string
  periodTo?: string
  comparative?: string
  categories?: string[]
  costCenter?: string[]
  analysisType?: "caixa" | "competencia"
  showBudget?: boolean
}

export async function fetchDre(options: FetchDreOptions): Promise<DreResponse> {
  const params = new URLSearchParams()
  if (options.period) params.set("period", options.period)
  if (options.periodFrom) params.set("periodFrom", options.periodFrom)
  if (options.periodTo) params.set("periodTo", options.periodTo)
  if (options.comparative) params.set("comparative", options.comparative)
  if (options.categories && options.categories.length > 0) params.set("categories", options.categories.join(","))
  if (options.costCenter && options.costCenter.length > 0) params.set("costCenter", options.costCenter.join(","))
  if (options.analysisType) params.set("analysisType", options.analysisType)
  if (options.showBudget) params.set("showBudget", "true")
  const res = await fetch(`${BASE}/api/dre?${params}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DRE fetch failed: ${res.status} ${body}`)
  }
  return res.json() as Promise<DreResponse>
}

export async function fetchDreMultiPeriod(
  periodFrom: string,
  periodTo: string,
  costCenter?: string[],
  analysisType?: "caixa" | "competencia"
): Promise<DreMultiPeriodResponse> {
  const params = new URLSearchParams({ periodFrom, periodTo, multiPeriod: "true" })
  if (costCenter && costCenter.length > 0) params.set("costCenter", costCenter.join(","))
  if (analysisType) params.set("analysisType", analysisType)
  const res = await fetch(`${BASE}/api/dre?${params}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DRE multi-period fetch failed: ${res.status} ${body}`)
  }
  return res.json() as Promise<DreMultiPeriodResponse>
}

export async function fetchDreCategories(): Promise<DreCategoriesResponse> {
  const res = await fetch(`${BASE}/api/dre/categories`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Categories fetch failed: ${res.status} ${body}`)
  }
  return res.json() as Promise<DreCategoriesResponse>
}

export async function fetchDreCostCenters(): Promise<DreCostCentersResponse> {
  const res = await fetch(`${BASE}/api/dre/cost-centers`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Cost centers fetch failed: ${res.status} ${body}`)
  }
  return res.json() as Promise<DreCostCentersResponse>
}

export async function fetchDreDrill(code: string, period: string): Promise<DreDrillResponse> {
  const params = new URLSearchParams({ period })
  const res = await fetch(`${BASE}/api/dre/drill/${encodeURIComponent(code)}?${params}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Drill fetch failed: ${res.status} ${body}`)
  }
  return res.json() as Promise<DreDrillResponse>
}

export async function fetchDreEvolution(months = 12): Promise<DreEvolutionResponse> {
  const params = new URLSearchParams({ months: String(months) })
  const res = await fetch(`${BASE}/api/dre/evolution?${params}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Evolution fetch failed: ${res.status} ${body}`)
  }
  return res.json() as Promise<DreEvolutionResponse>
}

export function buildExportUrl(
  period?: string,
  periodFrom?: string,
  periodTo?: string,
  costCenter?: string[],
  analysisType?: "caixa" | "competencia"
): string {
  const params = new URLSearchParams({ format: "csv" })
  if (period) params.set("period", period)
  if (periodFrom) params.set("periodFrom", periodFrom)
  if (periodTo) params.set("periodTo", periodTo)
  if (costCenter && costCenter.length > 0) params.set("costCenter", costCenter.join(","))
  if (analysisType) params.set("analysisType", analysisType)
  return `${BASE}/api/dre/export?${params}`
}
