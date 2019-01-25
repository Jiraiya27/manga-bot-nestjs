import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LineController } from './line.controller';
import { ConfigModule } from '../config/config.module';
import { LineVerifyMiddleware } from './lineVerify.middleware';
import { RoomFeedModule } from '../roomFeed/roomFeed.module';
import { LineEventsService } from './lineEvents.service';
import { LineSDKService } from './lineSDK.service';
import { RssService } from '../rss/rss.service';
import { CommandsService } from './commands.service';

@Module({
  imports: [ConfigModule, RoomFeedModule],
  providers: [LineEventsService, LineSDKService, RssService, CommandsService],
  controllers: [LineController],
})
export class LineModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LineVerifyMiddleware).forRoutes('line');
  }
}
