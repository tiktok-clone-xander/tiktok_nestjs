import { DataSource } from 'typeorm';
import { CommentLike } from '../entities/comment-like.entity';
import { Comment } from '../entities/comment.entity';
import { Follow } from '../entities/follow.entity';
import { Like } from '../entities/like.entity';
import { Share } from '../entities/share.entity';

export const InteractionDataSource = new DataSource({
  type: 'postgres',
  host: process.env.INTERACTION_DB_HOST || 'localhost',
  port: parseInt(process.env.INTERACTION_DB_PORT) || 5432,
  username: process.env.INTERACTION_DB_USERNAME || 'postgres',
  password: process.env.INTERACTION_DB_PASSWORD || 'postgres',
  database: process.env.INTERACTION_DB_NAME || 'tiktok_interaction',
  entities: [Like, Comment, CommentLike, Follow, Share],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
