import { Test } from '@nestjs/testing';
import { LineModule } from './line.module';
import { Room } from '../room/room.entity';
import { LineEventsService } from './lineEvents.service';
import { Repository } from 'typeorm';
import { FollowEvent } from '@line/bot-sdk';
import { DBModule } from '../db.module';

describe('LineEventsService', () => {
  let roomRepository: Repository<Room>;
  let lineEventsService: LineEventsService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DBModule, LineModule],
    }).compile();

    roomRepository = app.get('RoomRepository');
    lineEventsService = app.get(LineEventsService);
  });

  describe('handleFollow', () => {
    afterAll(async () => {
      await roomRepository.clear();
    });

    it('Should create new room for a new chatId', async () => {
      const roomsBefore = await roomRepository.find();
      const followEvent: FollowEvent = {
        type: 'follow',
        replyToken: 'replyToken',
        timestamp: 1234567890,
        source: {
          type: 'user',
          userId: 'userId',
        },
      };
      await lineEventsService.handleFollow(followEvent);
      const roomsAfter = await roomRepository.find();
      expect(roomsBefore.length + 1).toBe(roomsAfter.length);
    });
  });
});
