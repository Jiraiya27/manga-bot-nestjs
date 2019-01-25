import { Injectable } from '@nestjs/common';
import { RssService } from '../rss/rss.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedRepository } from '../roomFeed/feed.repository';
import { RoomFeedsRepository } from '../roomFeed/roomFeeds.repository';

@Injectable()
export class CommandsService {
  constructor(
    private readonly rssService: RssService,
    @InjectRepository(FeedRepository)
    private readonly feedRepository: FeedRepository,
    @InjectRepository(RoomFeedsRepository)
    private readonly roomFeedsRepository: RoomFeedsRepository,
  ) {}

  async validateNewFeed(
    roomId: string,
    url: string,
    title: string,
    isGlobal: boolean,
  ) {
    // Validate source
    await this.rssService.parseUrl(url).catch(error => {
      throw error;
    });

    const existingFeeds = await this.feedRepository
      .createQueryBuilder('feed')
      .where('source = :url', { url })
      .orWhere('title = :title', { title })
      .getMany();

    // Validate global source
    const existingGlobalFeeds = existingFeeds.filter(f => f.global);
    if (existingGlobalFeeds.length) {
      const message =
        existingGlobalFeeds[0].source === url
          ? 'Global feed with the same source already exists. Please add using the global feed.'
          : 'Global feed with the same title already exists. Please pick another title for this feed.';
      throw new Error(message);
    }

    if (isGlobal) {
      return true;
    }

    // Validate with room's private source
    const existingPrivateFeedIds = existingFeeds
      .filter(f => !f.global)
      .map(f => f.id);
    const subscribedPrivateRoomFeed = await this.roomFeedsRepository
      .createQueryBuilder('roomFeeds')
      .where('roomFeeds.roomId = :roomId', { roomId })
      .andWhere('roomFeeds.feedId in (:feedIds)', { feedIds: existingPrivateFeedIds.toString() })
      .getOne();

    if (subscribedPrivateRoomFeed) {
      const subscribedFeed = existingFeeds.find(
        f => f.id === subscribedPrivateRoomFeed.feedId,
      );
      const message =
        subscribedFeed.source === url
          ? 'This room is already subscribed to a feed with the same source.'
          : 'This room is already subscribed to a feed with the same title. Please pick another title for this feed.';
      throw new Error(message);
    }

    return true;
  }

  async addSourcePrivate(chatId: string, url: string, title: string) {
    await this.validateNewFeed(chatId, url, title, false).catch(error => {
      throw error;
    });

    const feedDto = this.feedRepository.create();
    feedDto.global = false;
    feedDto.source = url;
    feedDto.title = title;
    const feed = await this.feedRepository.save(feedDto);

    const roomFeedsDto = this.roomFeedsRepository.create();
    roomFeedsDto.feedId = feed.id;
    roomFeedsDto.roomId = chatId;
    await this.roomFeedsRepository.save(roomFeedsDto);
  }
}
