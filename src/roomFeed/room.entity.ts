import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { RoomFeeds } from './roomFeeds.entity';

@Entity()
export class Room {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'text' })
  type: 'user' | 'group' | 'room';

  @Column({ type: 'text', nullable: true })
  lastPostbackString: string;

  @OneToMany(type => RoomFeeds, roomFeeds => roomFeeds.room)
  roomFeeds: RoomFeeds[];
}
