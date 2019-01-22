import { NestMiddleware, Injectable, MiddlewareFunction } from "@nestjs/common";
import { middleware } from "@line/bot-sdk";
import { ConfigService } from "../config/config.service";

@Injectable()
export class LineVerifyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  
  resolve(...args: any[]): MiddlewareFunction {
    return middleware(this.configService.LINE_CONFIG)
  }
}