import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LineController } from './line.controller';
import { ConfigModule } from '../config/config.module';
import { LineVerifyMiddleware } from './lineVerify.middleware';

@Module({
  imports: [ConfigModule],
  controllers: [LineController],
})
export class LineModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LineVerifyMiddleware).forRoutes('line');
  }
}
