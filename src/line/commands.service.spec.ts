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

  let feedGlobal: Feed;
  let feedPrivate: Feed;
  let room: Room;
  let roomSubscribed: Room;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DBModule, LineModule],
    }).compile();

    commandsService = app.get(CommandsService);
    feedRepository = app.get('FeedRepositoryRepository');
    roomRepository = app.get('RoomRepository');
    roomFeedsRepository = app.get('RoomFeedsRepositoryRepository');
  });

  beforeEach(async () => {
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

  afterEach(async () => {
    await feedRepository.query('TRUNCATE TABLE "feed" CASCADE;');
    await roomRepository.query('TRUNCATE TABLE "room" CASCADE;');
    // const count = await roomFeedsRepository.count();
    // console.log({ count });
  });

  describe('validateFeed', async () => {

    const UNUSED_VALID_RSS = 'https://readms.net/rss';

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

  describe('addSourceFromGlobal', () => {
    it('Should validate input', async () => {
      await expect(commandsService.addSourceFromGlobal(room.id, '')).rejects.toThrow('Title cannot be empty');
      await expect(commandsService.addSourceFromGlobal(room.id, 'title', JSON.parse(JSON.stringify({})))).rejects.toThrow('Filters must be an array');
    });

    it('Should validate that global feed exists', async () => {
      await expect(commandsService.addSourceFromGlobal(room.id, feedPrivate.title)).rejects.toThrow('Global feed');
    });

    it('Should fail if room is already subscribed', async () => {
      // sub to global feed
      const roomFeedsDto = roomFeedsRepository.create();
      roomFeedsDto.roomId = room.id;
      roomFeedsDto.feedId = feedGlobal.id;
      await roomFeedsRepository.save(roomFeedsDto);

      await expect(commandsService.addSourceFromGlobal(room.id, feedGlobal.title)).rejects.toThrow('This room is already subscribed');
    });

    it('Should add successfully with right parameters', async () => {
      await expect(commandsService.addSourceFromGlobal(room.id, feedGlobal.title)).resolves;
    });
  });
});
