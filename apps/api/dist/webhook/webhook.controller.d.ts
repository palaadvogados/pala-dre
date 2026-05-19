import { WebhookService } from "./webhook.service.js";
export declare class WebhookController {
    private readonly webhookService;
    private readonly logger;
    constructor(webhookService: WebhookService);
    handleClickUp(body: Record<string, unknown>): Promise<{
        action: string;
        taskId?: string;
        ok: boolean;
    }>;
}
//# sourceMappingURL=webhook.controller.d.ts.map