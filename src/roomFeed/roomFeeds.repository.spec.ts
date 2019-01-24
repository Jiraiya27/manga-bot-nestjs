import { Test } from '@nestjs/testing';
import { DBModule } from '../db.module';
import { RoomFeedModule } from './roomFeed.module';
import { RoomFeedsRepository } from './roomFeeds.repository';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { Feed } from './feed.entity';

describe('FeedRepository', () => {
  let roomFeedsRepository: RoomFeedsRepository;
  let roomRepository: Repository<Room>;
  let feedRepository: Repository<Feed>;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DBModule, RoomFeedModule],
      // Need this workaround for custom repository
      // https://github.com/nestjs/nest/issues/1229#issuecomment-432840300
      providers: [
        {
          provide: 'RoomFeedsRepositoryRepository',
          useClass: RoomFeedsRepository,
        },
      ],
    }).compile();

    roomFeedsRepository = app.get('RoomFeedsRepositoryRepository');
    roomRepository = app.get('RoomRepository');
    feedRepository = app.get('FeedRepository');
  });

  describe('findRoomFeed', () => {
    const roomId = 'roomId';
    const title = 'feed title';

    beforeAll(async () => {
      const room = roomRepository.create();
      room.id = roomId;
      room.type = 'user';

      const feed = feedRepository.create();
      feed.source = 'feed source';
      feed.title = title;

      const [dbRoom, dbFeed] = await Promise.all([
        roomRepository.save(room),
        feedRepository.save(feed),
      ]);

      const roomFeed = roomFeedsRepository.create();
      roomFeed.roomId = dbRoom.id;
      roomFeed.feedId = dbFeed.id;
      await roomFeedsRepository.save(roomFeed);
    });

    afterAll(async () => {
      await roomRepository.query('TRUNCATE TABLE "room" CASCADE');
      await feedRepository.query('TRUNCATE TABLE "feed" CASCADE');
      const roomFeedsCount = await roomFeedsRepository.count();
      expect(roomFeedsCount).toBe(0);
    });

    it('Should not find roomFeed with incorrect params', async () => {
      const roomFeedWrongId = await roomFeedsRepository.findRoomFeed('wrong id', title);
      expect(roomFeedWrongId).toBeFalsy();
      const roomFeedWrongTitle = await roomFeedsRepository.findRoomFeed(roomId, 'wrong title');
      expect(roomFeedWrongTitle).toBeFalsy();
    });

    it('Should find roomFeed with correct params', async () => {
      const roomFeed = await roomFeedsRepository.findRoomFeed(roomId, title);
      expect(roomFeed).toBeTruthy();
    });
  });
});
