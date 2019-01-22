import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
  });

  describe('root', () => {
    it('Should return process\'s uptime', () => {
      const appController = app.get(AppController);
      expect(typeof appController.upTime()).toBe('number');
    });
  });
});
