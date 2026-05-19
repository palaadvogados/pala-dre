import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env") });
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
const PORT = Number(process.env["PORT"] ?? 3003);
const HOST = process.env["HOST"] ?? "0.0.0.0";
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });
    app.enableCors({ origin: true });
    app.setGlobalPrefix("api");
    await app.listen(PORT, HOST);
    console.log(`API running on port ${PORT} (USE_MOCK=${process.env["USE_MOCK"] !== "false"})`);
}
bootstrap();
//# sourceMappingURL=main.js.map