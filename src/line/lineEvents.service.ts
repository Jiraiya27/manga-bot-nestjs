import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../room/room.entity';
import { Repository } from 'typeorm';
import { FollowEvent } from '@line/bot-sdk';
import { LineSDKService } from './lineSDK.service';

@Injectable()
export class LineEventsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private lineSDKService: LineSDKService,
  ) {}

  async handleFollow(event: FollowEvent) {
    const chatId = this.lineSDKService.getChatId(event);
    const room = this.roomRepository.create();
    room.id = chatId;
    room.type = event.source.type;
    await this.roomRepository.save(room);
  }
}
