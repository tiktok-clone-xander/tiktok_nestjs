import { DataSource } from 'typeorm';
import { VideoView } from '../entities/video-view.entity';
import { Video } from '../entities/video.entity';

export const VideoDataSource = new DataSource({
  type: 'postgres',
  host: process.env.VIDEO_DB_HOST || 'localhost',
  port: parseInt(process.env.VIDEO_DB_PORT) || 5432,
  username: process.env.VIDEO_DB_USERNAME || 'postgres',
  password: process.env.VIDEO_DB_PASSWORD || 'postgres',
  database: process.env.VIDEO_DB_NAME || 'tiktok_video',
  entities: [Video, VideoView],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
