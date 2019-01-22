import { Test } from '@nestjs/testing';
import { WebhookEvent } from '@line/bot-sdk';
import { INestApplication } from '@nestjs/common';
import { LineModule } from '../src/line/line.module';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { generateLineSignature } from './test-utils';
import { ConfigModule } from '../src/config/config.module';
import { ConfigService } from '../src/config/config.service';

describe('LineController (e2e)', () => {
  let app: INestApplication;
  const event: WebhookEvent = {
    type: 'join',
    timestamp: Date.now(),
    replyToken: 'replyToken',
    source: {
      type: 'user',
      userId: 'userId',
    },
  };
  const body = { events: [event] };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, LineModule, ConfigModule],
    }).compile();

    // NOTE: bodyParser needs to be false
    app = moduleFixture.createNestApplication(undefined, { bodyParser: false });
    await app.init();
  });

  describe('/line/webhook (POST)', () => {
    it('Should fail with missing signature', () => {
      return request(app.getHttpServer())
        .post('/line/webhook')
        .send(body)
        .expect(500);
    });

    it('Should fail with incorrect signature', () => {
      return (
        request(app.getHttpServer())
          .post('/line/webhook')
          .set('x-line-signature', 'random_signature')
          .send(body)
          .expect(500)
      );
    });

    it('Should pass with correct signature', () => {
      const configService = app.get(ConfigService);
      const signature = generateLineSignature(
        JSON.stringify(body),
        configService.LINE_CONFIG.channelSecret,
      );
      return request(app.getHttpServer())
        .post('/line/webhook')
        .set('x-line-signature', signature)
        .send(body)
        .expect(200);
    });

    it('Validation should not affect other routes', () => {
      request(app.getHttpServer())
        .get('/')
        .expect(200)
    });
  });
});
