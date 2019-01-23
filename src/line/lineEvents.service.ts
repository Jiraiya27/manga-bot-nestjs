import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../roomFeed/room.entity';
import { Repository } from 'typeorm';
import { FollowEvent, UnfollowEvent, JoinEvent, LeaveEvent, EventBase } from '@line/bot-sdk';
import { LineSDKService } from './lineSDK.service';

@Injectable()
export class LineEventsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private lineSDKService: LineSDKService,
  ) {}

  async handleFollow(event: FollowEvent) {
    return this.saveRoom(event);
  }

  async handleUnfollow(event: UnfollowEvent) {
    return this.deleteRoom(event);
  }

  async handleJoin(event: JoinEvent) {
    return this.saveRoom(event);
  }

  async handleLeave(event: LeaveEvent) {
    return this.deleteRoom(event);
  }

  private async saveRoom(event: EventBase) {
    const chatId = this.lineSDKService.getChatId(event);
    const room = this.roomRepository.create();
    room.id = chatId;
    room.type = event.source.type;
    return this.roomRepository.save(room);
  }

  private async deleteRoom(event: EventBase) {
    const chatId = this.lineSDKService.getChatId(event);
    return this.roomRepository.delete({ id: chatId });
  }
}
