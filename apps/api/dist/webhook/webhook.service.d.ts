export declare class WebhookService {
    private readonly logger;
    private accountCodeCache;
    private resolveAccountCode;
    private fetchClickUpTask;
    private extractField;
    private buildEntryFromTask;
    processWebhook(payload: Record<string, unknown>): Promise<{
        action: string;
        taskId?: string;
    }>;
}
//# sourceMappingURL=webhook.service.d.ts.map