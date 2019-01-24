import { EntityRepository, Repository } from 'typeorm';
import { RoomFeeds } from './roomFeeds.entity';

@EntityRepository(RoomFeeds)
export class RoomFeedsRepository extends Repository<RoomFeeds> {
  findRoomFeed(id: string, title: string) {
    return this.createQueryBuilder('roomFeeds')
    .innerJoinAndMapOne('roomFeeds.room', 'roomFeeds.room', 'room', 'room.id = :id', { id })
    .innerJoinAndMapOne('roomFeeds.feed', 'roomFeeds.feed', 'feed', 'feed.title = :title', { title })
    .getOne();
  }
}
