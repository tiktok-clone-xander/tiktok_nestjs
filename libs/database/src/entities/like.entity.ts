import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity('likes')
@Unique(['userId', 'videoId'])
@Index(['videoId', 'createdAt'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  userId: string;

  @Index()
  videoId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Video, (video) => video.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
