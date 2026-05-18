"use client"

import { useDreDrill } from "@/hooks/use-dre-data"
import { formatBRL } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DreDrillModalProps {
  code: string
  period: string
  onClose: () => void
}

export function DreDrillModal({ code, period, onClose }: DreDrillModalProps) {
  const { data, isLoading, error } = useDreDrill(code, period)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              {data?.name ?? code}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {period}{data ? ` — ${formatBRL(data.total)}` : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 rounded-full border-2 border-ring border-t-transparent animate-spin" />
            </div>
          )}
          {error && (
            <p className="text-center text-destructive py-8 text-sm">
              Erro ao carregar lancamentos
            </p>
          )}
          {data && data.entries.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Nenhum lancamento neste periodo
            </p>
          )}
          {data && data.entries.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descricao
                  </th>
                  <th className="pb-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-foreground/80">{entry.description ?? "-"}</td>
                    <td
                      className={cn(
                        "py-2.5 text-right tabular-nums font-medium",
                        entry.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {formatBRL(entry.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t">
                  <td className="pt-3 font-semibold text-foreground">Total</td>
                  <td
                    className={cn(
                      "pt-3 text-right tabular-nums font-bold",
                      data.total >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {formatBRL(data.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
