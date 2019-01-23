import { Controller, Body, Res, HttpStatus, Post } from '@nestjs/common';
import { WebhookEvent } from '@line/bot-sdk';
import { Response } from 'express';
import { LineEventsService } from './lineEvents.service';

@Controller('line')
export class LineController {
  constructor(private readonly lineEventsService: LineEventsService) {}

  @Post('webhook')
  async webhook(@Body('events') events: WebhookEvent[], @Res() res: Response) {
    try {
      await Promise.all(events.map(this.handleEvent));
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async handleEvent(event: WebhookEvent) {
    switch (event.type) {
      case 'follow':
        return this.lineEventsService.handleFollow(event);
      case 'unfollow':
        return this.lineEventsService.handleUnfollow(event);
      case 'join':
        return this.lineEventsService.handleJoin(event);
      case 'leave':
        return this.lineEventsService.handleLeave(event);
      default:
        return Promise.resolve();
    }
  }
}
