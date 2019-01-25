import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './room.entity';
import { Feed } from './feed.entity';

@Entity()
export class RoomFeeds {
  @PrimaryColumn({ type: 'text' })
  roomId: string;
  @ManyToOne(type => Room, room => room.roomFeeds, {
    primary: true,
    onDelete: 'CASCADE',
  })
  room: Room;

  @PrimaryColumn({ type: 'int' })
  feedId: number;
  @ManyToOne(type => Feed, feed => feed.roomFeeds, {
    primary: true,
    onDelete: 'CASCADE',
  })
  feed: Feed;

  @Column({ type: 'json', default: [] })
  filters: string[];
}
