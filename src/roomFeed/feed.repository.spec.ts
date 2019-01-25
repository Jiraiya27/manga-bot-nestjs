import { Test } from '@nestjs/testing';
import { DBModule } from '../db.module';
import { RoomFeedModule } from './roomFeed.module';
import { FeedRepository } from './feed.repository';

describe('FeedRepository', () => {
  let feedRepository: FeedRepository;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DBModule, RoomFeedModule],
      // Need this workaround for custom repository
      // https://github.com/nestjs/nest/issues/1229#issuecomment-432840300
      providers: [
        {
          provide: 'FeedRepositoryRepository',
          useClass: FeedRepository,
        },
      ],
    }).compile();

    feedRepository = app.get('FeedRepositoryRepository');
  });

  afterEach(async () => {
    await feedRepository.query('TRUNCATE TABLE "feed" CASCADE');
  });

  describe('findPastUpdate', () => {
    it('Should not find only records where interval has passed lastUpdatedTime', async () => {
      // Insert mock data
      const lastUpdated = new Date();
      const lastUpdated1 = new Date(lastUpdated.getTime() - 60000 * 9); // - 9 mins
      const lastUpdated2 = new Date(lastUpdated.getTime() - 60000 * 10); // - 10 mins
      const lastUpdated3 = new Date(lastUpdated.getTime() - 60000 * 11); // - 11 mins
      const baseMockFeed = {
        frequency: 10, // frequency 10 mins
        global: true,
        lastItem: {},
        source: 'source',
      };
      const mockFeeds = [
        { ...baseMockFeed, title: 'title1', lastUpdated: lastUpdated1 },
        { ...baseMockFeed, title: 'title2', lastUpdated: lastUpdated2 },
        { ...baseMockFeed, title: 'title3', lastUpdated: lastUpdated3 },
      ];
      const feedEntities = feedRepository.create(mockFeeds);
      await feedRepository.save(feedEntities);

      // verify only mock data exists
      const feedsCount = await feedRepository.count();
      expect(feedsCount).toBe(mockFeeds.length);

      // Find and sort result
      const feeds = await feedRepository
        .findPastUpdate()
        .then(result => result.sort((a, b) => a.title < b.title ? -1 : 1));
      expect(feeds.length).toBe(2);
      expect(feeds[0].title).toBe('title2');
      expect(feeds[1].title).toBe('title3');
    });
  });
});
