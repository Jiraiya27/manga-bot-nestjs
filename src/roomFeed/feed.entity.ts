import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Items } from 'rss-parser';
import { RoomFeeds } from './roomFeeds.entity';

@Entity()
export class Feed {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'text' })
  source: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'integer', default: 30 })
  frequency: number;

  @Column({ type: 'boolean', default: false })
  global: boolean;

  @Column({ type: 'timestamptz', default: new Date() })
  lastUpdated: Date;

  @Column({ type: 'json', nullable: true })
  lastItem: Items;

  @OneToMany(type => RoomFeeds, roomFeeds => roomFeeds.feed)
  roomFeeds: RoomFeeds[];
}
