import { Injectable, Logger } from "@nestjs/common"
import {
  upsertEntry,
  deleteEntryByClickupTaskId,
  getEntryByClickupTaskId,
  logWebhook,
  getAllAccounts,
  type UpsertEntryData,
} from "@pala-dre/db"

const CLICKUP_API_KEY = process.env["CLICKUP_API_KEY"] ?? ""
const LIST_PAGAR = process.env["CLICKUP_LIST_PAGAR"] ?? "901321718675"
const LIST_RECEBER = process.env["CLICKUP_LIST_RECEBER"] ?? "901321718692"
const RELEVANT_LISTS = new Set([LIST_PAGAR, LIST_RECEBER])

const CF_CODIGO_CONTA = "e0f014cb"
const CF_VALOR = "bda5b321"
const CF_CONTA_BANCARIA = "e60521eb"
const CF_FORMA_PAGAMENTO = "3f0d314a"
const CF_DATA_PAGAMENTO = "df602102" // "Data Pagamento/Recebimento" (date) → regime de caixa

interface ClickUpCustomField {
  id: string
  name: string
  type: string
  value?: unknown
  type_config?: {
    options?: Array<{
      id: string
      name: string
      orderindex: number
    }>
  }
}

interface ClickUpTask {
  id: string
  name: string
  status: { status: string }
  date_created: string
  due_date: string | null
  list: { id: string }
  custom_fields: ClickUpCustomField[]
}

function extractDropdownValue(field: ClickUpCustomField): string | null {
  if (!field.value && field.value !== 0) return null
  const idx = typeof field.value === "number" ? field.value : parseInt(String(field.value), 10)
  if (isNaN(idx)) return null
  const options = field.type_config?.options
  if (!options) return null
  const option = options.find((o) => o.orderindex === idx)
  return option?.name ?? null
}

function extractCurrencyValue(field: ClickUpCustomField): number | null {
  if (field.value === null || field.value === undefined) return null
  const raw = typeof field.value === "string" ? parseFloat(field.value) : Number(field.value)
  if (isNaN(raw)) return null
  return raw
}

function dueDateToPeriod(dueDate: string | null): string | null {
  if (!dueDate) return null
  const ts = parseInt(dueDate, 10)
  if (isNaN(ts)) return null
  const d = new Date(ts)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name)
  private accountCodeCache: Map<string, string> | null = null

  private async resolveAccountCode(dropdownValue: string | null): Promise<string | null> {
    if (!dropdownValue) return null

    const codeMatch = dropdownValue.match(/^([\d.]+)\s*[-–]/)
    if (codeMatch?.[1]) return codeMatch[1]

    if (!this.accountCodeCache) {
      const accounts = await getAllAccounts()
      this.accountCodeCache = new Map()
      for (const a of accounts) {
        this.accountCodeCache.set(a.name.toLowerCase().trim(), a.code)
        this.accountCodeCache.set(`${a.code} - ${a.name}`.toLowerCase().trim(), a.code)
      }
    }

    const normalized = dropdownValue.toLowerCase().trim()
    return this.accountCodeCache.get(normalized) ?? null
  }

  private async fetchClickUpTask(taskId: string): Promise<ClickUpTask | null> {
    try {
      const resp = await fetch(
        `https://api.clickup.com/api/v2/task/${taskId}?custom_task_ids=false&include_subtasks=false`,
        {
          headers: { Authorization: CLICKUP_API_KEY },
        }
      )
      if (!resp.ok) {
        this.logger.warn(`ClickUp API returned ${resp.status} for task ${taskId}`)
        return null
      }
      return (await resp.json()) as ClickUpTask
    } catch (err) {
      this.logger.error(`Failed to fetch task ${taskId}: ${err}`)
      return null
    }
  }

  private extractField(task: ClickUpTask, fieldId: string): ClickUpCustomField | undefined {
    // Constantes usam o prefixo do UUID; a API retorna o id completo.
    return task.custom_fields.find((f) => f.id === fieldId || f.id.startsWith(fieldId))
  }

  private async buildEntryFromTask(task: ClickUpTask): Promise<UpsertEntryData | null> {
    const codigoField = this.extractField(task, CF_CODIGO_CONTA)
    const valorField = this.extractField(task, CF_VALOR)
    const contaBancariaField = this.extractField(task, CF_CONTA_BANCARIA)
    const formaPagField = this.extractField(task, CF_FORMA_PAGAMENTO)

    const codigoDropdown = codigoField ? extractDropdownValue(codigoField) : null
    const accountCode = await this.resolveAccountCode(codigoDropdown)

    if (!accountCode) {
      this.logger.warn(`No account code resolved for task ${task.id} (dropdown=${codigoDropdown})`)
      return null
    }

    const amount = valorField ? extractCurrencyValue(valorField) : null
    if (amount === null || amount === 0) {
      this.logger.warn(`No amount for task ${task.id}`)
      return null
    }

    const period = dueDateToPeriod(task.due_date)
    if (!period) {
      this.logger.warn(`No due date for task ${task.id}`)
      return null
    }

    const bank = contaBancariaField ? extractDropdownValue(contaBancariaField) : null
    const paymentMethod = formaPagField ? extractDropdownValue(formaPagField) : null

    // Data da baixa efetiva → regime de caixa. Vazia = ainda não paga/recebida (fora do caixa).
    const dataPagField = this.extractField(task, CF_DATA_PAGAMENTO)
    const periodCaixa = dataPagField?.value != null
      ? dueDateToPeriod(String(dataPagField.value))
      : null

    return {
      account_code: accountCode,
      period,
      amount,
      description: task.name,
      bank,
      payment_method: paymentMethod,
      status: task.status?.status ?? "pending",
      source: "clickup",
      source_id: `clickup-${task.id}`,
      clickup_task_id: task.id,
      clickup_list_id: task.list?.id ?? null,
      period_caixa: periodCaixa,
    }
  }

  async processWebhook(payload: Record<string, unknown>): Promise<{ action: string; taskId?: string }> {
    const event = String(payload["event"] ?? "unknown")
    const historyItems = payload["history_items"] as Array<Record<string, unknown>> | undefined
    const taskId = String(
      payload["task_id"] ??
      (payload["payload"] as Record<string, unknown> | undefined)?.["id"] ??
      ""
    )
    const listId = historyItems?.[0]?.["parent_id"]
      ? String(historyItems[0]["parent_id"])
      : ""

    try {
      if (event === "taskDeleted") {
        if (taskId) {
          const deleted = await deleteEntryByClickupTaskId(taskId)
          await logWebhook(event, taskId, listId, payload, true, null)
          return { action: deleted ? "deleted" : "not_found", taskId }
        }
        await logWebhook(event, taskId, listId, payload, false, "no task_id")
        return { action: "ignored" }
      }

      if (event === "taskCreated" || event === "taskUpdated") {
        if (!taskId) {
          await logWebhook(event, null, listId, payload, false, "no task_id")
          return { action: "ignored" }
        }

        const task = await this.fetchClickUpTask(taskId)
        if (!task) {
          await logWebhook(event, taskId, listId, payload, false, "fetch_failed")
          return { action: "fetch_failed", taskId }
        }

        if (!RELEVANT_LISTS.has(task.list?.id)) {
          // Task saiu das lists Pagar/Receber: remove o lançamento pra não virar fantasma no DRE.
          const removed = await deleteEntryByClickupTaskId(taskId)
          await logWebhook(event, taskId, task.list?.id, payload, true, null)
          return { action: removed ? "removed_irrelevant_list" : "irrelevant_list", taskId }
        }

        const entryData = await this.buildEntryFromTask(task)
        if (!entryData) {
          // Perdeu um campo obrigatório (valor/conta zerados): remove o lançamento antigo
          // em vez de deixá-lo desatualizado no banco.
          const removed = await deleteEntryByClickupTaskId(taskId)
          await logWebhook(event, taskId, task.list?.id, payload, true, "missing_fields")
          return { action: removed ? "removed_missing_fields" : "missing_fields", taskId }
        }

        await upsertEntry(entryData)
        await logWebhook(event, taskId, task.list?.id, payload, true, null)
        return { action: event === "taskCreated" ? "created" : "updated", taskId }
      }

      await logWebhook(event, taskId || null, listId || null, payload, true, null)
      return { action: "ignored_event" }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      this.logger.error(`Webhook processing error: ${errorMsg}`)
      try {
        await logWebhook(event, taskId || null, listId || null, payload, false, errorMsg)
      } catch (_) {}
      return { action: "error", taskId }
    }
  }
}
