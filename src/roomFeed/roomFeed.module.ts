import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomService } from './room.service';
import { Feed } from './feed.entity';
import { RoomFeeds } from './roomFeeds.entity';
import { FeedRepository } from './feed.repository';
import { RoomFeedsRepository } from './roomFeeds.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feed,
      FeedRepository,
      Room,
      RoomFeeds,
      RoomFeedsRepository,
    ]),
  ],
  providers: [RoomService],
})
export class RoomFeedModule {}
