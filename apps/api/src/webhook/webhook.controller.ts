import { Controller, Post, Body, Logger, Inject } from "@nestjs/common"
import { WebhookService } from "./webhook.service.js"

@Controller("webhook")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(@Inject(WebhookService) private readonly webhookService: WebhookService) {}

  @Post("clickup")
  async handleClickUp(@Body() body: Record<string, unknown>) {
    this.logger.log(`Webhook received: ${body["event"] ?? "unknown"}`)
    const result = await this.webhookService.processWebhook(body)
    return { ok: true, ...result }
  }
}
