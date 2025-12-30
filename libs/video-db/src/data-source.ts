import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Video, VideoView } from './entities';

export const createVideoDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get('VIDEO_DB_HOST', 'localhost'),
    port: configService.get('VIDEO_DB_PORT', 5432),
    username: configService.get('VIDEO_DB_USERNAME', 'postgres'),
    password: configService.get('VIDEO_DB_PASSWORD', 'postgres'),
    database: configService.get('VIDEO_DB_NAME', 'tiktok_video'),
    entities: [Video, VideoView],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
  });
};
