import { Test } from '@nestjs/testing';
import { LineModule } from './line.module';
import { DBModule } from '../db.module';
import { CommandsService } from './commands.service';
import { FeedRepository } from '../roomFeed/feed.repository';
import { Feed } from '../roomFeed/feed.entity';
import { Repository } from 'typeorm';
import { Room } from '../roomFeed/room.entity';
import { RoomFeedsRepository } from '../roomFeed/roomFeeds.repository';

describe('CommandsService', () => {
  let commandsService: CommandsService;
  let feedRepository: FeedRepository;
  let roomRepository: Repository<Room>;
  let roomFeedsRepository: RoomFeedsRepository;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DBModule, LineModule],
    }).compile();

    commandsService = app.get(CommandsService);
    feedRepository = app.get('FeedRepositoryRepository');
    roomRepository = app.get('RoomRepository');
    roomFeedsRepository = app.get('RoomFeedsRepositoryRepository');
  });

  describe('validateFeed', async () => {
    let feedGlobal: Feed;
    let feedPrivate: Feed;
    let room: Room;
    let roomSubscribed: Room;

    const UNUSED_VALID_RSS = 'https://readms.net/rss';

    beforeAll(async () => {
      const feedGlobalDto = feedRepository.create();
      feedGlobalDto.source = 'https://feedforall.com/sample.xml';
      feedGlobalDto.title = 'title1';
      feedGlobalDto.global = true;
      feedGlobal = await feedRepository.save(feedGlobalDto);

      const feedPrivateDto = feedRepository.create();
      feedPrivateDto.source = 'https://feedforall.com/sample-feed.xml';
      feedPrivateDto.title = 'title2';
      feedPrivateDto.global = false;
      feedPrivate = await feedRepository.save(feedPrivateDto);

      const roomDto = roomRepository.create();
      roomDto.id = 'roomId';
      roomDto.type = 'user';
      room = await roomRepository.save(roomDto);

      const roomSubscribedDto = roomRepository.create();
      roomSubscribedDto.id = 'roomSubscribedId';
      roomSubscribedDto.type = 'user';
      roomSubscribed = await roomRepository.save(roomSubscribedDto);

      const roomFeedsDto = roomFeedsRepository.create();
      roomFeedsDto.roomId = roomSubscribed.id;
      roomFeedsDto.feedId = feedPrivate.id;
      await roomFeedsRepository.save(roomFeedsDto);
    });

    afterAll(async () => {
      await feedRepository.query('TRUNCATE TABLE "feed" CASCADE;');
      await roomRepository.query('TRUNCATE TABLE "room" CASCADE;');
    });

    it('[Global and Private] Should fail if global feed exists', async () => {
      // Old source + new title
      let e;
      try {
        await commandsService.validateNewFeed(room.id, feedGlobal.source, 'new title', false);
      } catch (error) {
        e = error;
      }
      expect(e.message).toMatch(/Global feed with the same source/);

      // New valid source + existing title
      try {
        await commandsService.validateNewFeed(room.id, UNUSED_VALID_RSS, feedGlobal.title, false);
      } catch (error) {
        e = error;
      }
      expect(e.message).toMatch(/Global feed with the same title/);
    });

    it('[Global and Private] Should pass even if other private rooms has the same feed', async () => {
      const resultSameSource = await commandsService.validateNewFeed(room.id, feedPrivate.source, 'new title', false);
      expect(resultSameSource).toBeTruthy();
      const resultSameTitle = await commandsService.validateNewFeed(room.id, UNUSED_VALID_RSS, feedPrivate.title, false);
      expect(resultSameTitle).toBeTruthy();
    });

    it('[Private] Should fail if current room has the same feed already', async () => {
      let e;
      // Same source
      try {
        await commandsService.validateNewFeed(roomSubscribed.id, feedPrivate.source, 'some random title', false);
      } catch (error) {
        e = error;
      }
      expect(e.message).toMatch(/This room is already subscribed to a feed with the same source/);

      // Same title
      try {
        await commandsService.validateNewFeed(roomSubscribed.id, UNUSED_VALID_RSS, feedPrivate.title, false);
      } catch (error) {
        e = error;
      }
      expect(e.message).toMatch(/This room is already subscribed to a feed with the same title/);
    });
  });
});
