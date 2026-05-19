var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
import { Controller, Post, Body, Logger, Inject } from "@nestjs/common";
import { WebhookService } from "./webhook.service.js";
let WebhookController = WebhookController_1 = class WebhookController {
    webhookService;
    logger = new Logger(WebhookController_1.name);
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    async handleClickUp(body) {
        this.logger.log(`Webhook received: ${body["event"] ?? "unknown"}`);
        const result = await this.webhookService.processWebhook(body);
        return { ok: true, ...result };
    }
};
__decorate([
    Post("clickup"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleClickUp", null);
WebhookController = WebhookController_1 = __decorate([
    Controller("webhook"),
    __param(0, Inject(WebhookService)),
    __metadata("design:paramtypes", [WebhookService])
], WebhookController);
export { WebhookController };
//# sourceMappingURL=webhook.controller.js.map