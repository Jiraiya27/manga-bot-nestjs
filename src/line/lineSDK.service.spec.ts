import { Test } from '@nestjs/testing';
import { LineSDKService } from './lineSDK.service';
import { User, Room, EventBase, Group } from '@line/bot-sdk';

describe('LineSDKService', () => {
  let lineSDKService: LineSDKService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [LineSDKService],
    }).compile();
    lineSDKService = app.get(LineSDKService);
  });

  describe('getChatId', () => {
    it('Should return roomId for events from room', () => {
      const roomId = 'someRoomId';
      const roomSource: Room = {
        type: 'room',
        roomId,
      };
      const event: EventBase = {
        source: roomSource,
        timestamp: 1234567890,
      };
      const chatId = lineSDKService.getChatId(event);
      expect(chatId).toBe(roomId);
    });

    it('Should return groupId for events from group', () => {
      const groupId = 'someGroupId';
      const roomSource: Group = {
        type: 'group',
        groupId,
      };
      const event: EventBase = {
        source: roomSource,
        timestamp: 1234567890,
      };
      const chatId = lineSDKService.getChatId(event);
      expect(chatId).toBe(groupId);
    });

    it('Should return userId for events from user', () => {
      const userId = 'someUserId';
      const roomSource: User = {
        type: 'user',
        userId,
      };
      const event: EventBase = {
        source: roomSource,
        timestamp: 1234567890,
      };
      const chatId = lineSDKService.getChatId(event);
      expect(chatId).toBe(userId);
    });
  });
});
