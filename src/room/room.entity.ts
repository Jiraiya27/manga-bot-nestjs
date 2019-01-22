import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'text' })
  type: 'user' | 'group' | 'room';

  @Column({ type: 'text', nullable: true })
  lastPostbackString: string;
}
