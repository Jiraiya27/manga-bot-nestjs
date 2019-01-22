import { Injectable } from '@nestjs/common';
import { EventBase } from '@line/bot-sdk';

@Injectable()
export class LineSDKService {

  getChatId(event: EventBase) {
    let chatId: string;
    if (event.source.type === 'group') {
      chatId = event.source.groupId;
    } else if (event.source.type === 'room') {
      chatId = event.source.roomId;
    } else {
      chatId = event.source.userId;
    }

    return chatId;
  }
}
