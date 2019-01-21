import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text' })
  type: 'user' | 'group' | 'room'

  @Column({ type: 'text', nullable: true })
  lastPostbackString: string
}
