import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Comment, CommentLike, Follow, Like, Share } from './entities';

export const createInteractionDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get('INTERACTION_DB_HOST', 'localhost'),
    port: configService.get('INTERACTION_DB_PORT', 5432),
    username: configService.get('INTERACTION_DB_USERNAME', 'postgres'),
    password: configService.get('INTERACTION_DB_PASSWORD', 'postgres'),
    database: configService.get('INTERACTION_DB_NAME', 'tiktok_interaction'),
    entities: [Like, Comment, CommentLike, Follow, Share],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
  });
};
