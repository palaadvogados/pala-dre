import { Module } from "@nestjs/common"
import { DreController } from "./dre.controller.js"
import { DreService } from "./dre.service.js"

@Module({
  controllers: [DreController],
  providers: [DreService],
})
export class DreModule {}
