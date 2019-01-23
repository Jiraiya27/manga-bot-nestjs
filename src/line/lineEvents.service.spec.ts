import { Test } from '@nestjs/testing';
import { LineModule } from './line.module';
import { Room } from '../room/room.entity';
import { LineEventsService } from './lineEvents.service';
import { Repository } from 'typeorm';
import { FollowEvent, ReplyableEvent, UnfollowEvent, JoinEvent, LeaveEvent } from '@line/bot-sdk';
import { DBModule } from '../db.module';

describe('LineEventsService', () => {
  let roomRepository: Repository<Room>;
  let lineEventsService: LineEventsService;

  const baseEvent: ReplyableEvent = {
    replyToken: 'token',
    timestamp: 1234567890,
    source: {
      type: 'user',
      userId: 'userId',
    },
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DBModule, LineModule],
    }).compile();

    roomRepository = app.get('RoomRepository');
    lineEventsService = app.get(LineEventsService);
  });

  beforeEach(async () => {
    await roomRepository.clear();
  });

  describe('handleFollow', () => {
    it('Should create new room for a new chatId', async () => {
      const roomsBefore = await roomRepository.count();
      const followEvent: FollowEvent = {
        type: 'follow',
        ...baseEvent,
      };
      await lineEventsService.handleFollow(followEvent);
      const roomsAfter = await roomRepository.count();
      expect(roomsBefore + 1).toBe(roomsAfter);
    });
  });

  describe('handleUnfollow', () => {
    it('Should delete the room', async () => {
      const preexistingRoom = roomRepository.create();
      preexistingRoom.id = baseEvent.source.userId;
      preexistingRoom.type = baseEvent.source.type;
      await roomRepository.save(preexistingRoom);

      const unfollowEvent: UnfollowEvent = {
        type: 'unfollow',
        ...baseEvent,
      };
      const roomsBefore = await roomRepository.count();
      await lineEventsService.handleUnfollow(unfollowEvent);
      const roomsAfter = await roomRepository.count();

      expect(roomsBefore - 1).toBe(roomsAfter);
    });
  });

  describe('handleJoin', () => {
    it('Should create new room for a new chatId', async () => {
      const roomsBefore = await roomRepository.count();
      const joinEvent: JoinEvent = {
        type: 'join',
        ...baseEvent,
      };
      await lineEventsService.handleJoin(joinEvent);
      const roomsAfter = await roomRepository.count();
      expect(roomsBefore + 1).toBe(roomsAfter);
    });
  });

  describe('handleLeave', () => {
    it('Should delete the room', async () => {
      const preexistingRoom = roomRepository.create();
      preexistingRoom.id = baseEvent.source.userId;
      preexistingRoom.type = baseEvent.source.type;
      await roomRepository.save(preexistingRoom);

      const leaveEvent: LeaveEvent = {
        type: 'leave',
        ...baseEvent,
      };
      const roomsBefore = await roomRepository.count();
      await lineEventsService.handleLeave(leaveEvent);
      const roomsAfter = await roomRepository.count();

      expect(roomsBefore - 1).toBe(roomsAfter);
    });
  });
});
