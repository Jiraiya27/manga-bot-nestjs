import { Test } from '@nestjs/testing';
import { RssService } from './rss.service';

describe('RssService', () => {
  let rssService: RssService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [RssService],
    }).compile();
    rssService = app.get(RssService);
  });

  describe('parseUrl', () => {
    it('Should fail for non-valid urls', async () => {
      const url = 'something not a url';
      let e;
      try {
        await rssService.parseUrl(url);
      } catch (error) {
        e = error;
      }
      expect(e.message).toMatch(/is not a valid url/);
    });

    it('Should fail for non-rss urls', async () => {
      const url = 'https://google.com';
      let e;
      try {
        await rssService.parseUrl(url);
      } catch (error) {
        e = error;
      }
      expect(e.message).toMatch(/Could not parse/);
    });

    it('Should return the same "feedUrl" in response regardless of trailing slash', async () => {
      const url = 'https://readms.net/rss';
      const resultWithoutSlash = await rssService.parseUrl(url);
      const resultWithSlash = await rssService.parseUrl(`${url}/`);
      expect(resultWithoutSlash.feedUrl).toBeTruthy();
      expect(resultWithoutSlash.feedUrl).toBe(resultWithSlash.feedUrl);
    });
  });
});
