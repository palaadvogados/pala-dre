import { Module } from "@nestjs/common"
import { DreModule } from "./dre/dre.module.js"
import { WebhookModule } from "./webhook/webhook.module.js"

@Module({
  imports: [DreModule, WebhookModule],
})
export class AppModule {}
