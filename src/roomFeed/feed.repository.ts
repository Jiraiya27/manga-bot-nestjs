import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './feed.entity';

@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  findPastUpdate() {
    return this.createQueryBuilder('feed')
      .where("feed.lastUpdated <= current_timestamp - interval '1 mins' * feed.frequency")
      .leftJoinAndSelect('feed.roomFeeds', 'roomFeeds')
      .leftJoinAndSelect('roomFeeds.room', 'room')
      .getMany();
  }
}
