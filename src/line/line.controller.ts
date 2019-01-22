import { Controller, Body, Res, HttpStatus, Post } from '@nestjs/common';
import { WebhookEvent } from '@line/bot-sdk';
import { Response } from 'express';

@Controller('line')
export class LineController {
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
      default:
        return Promise.resolve();
    }
  }
}
