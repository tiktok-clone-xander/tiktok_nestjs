#!/usr/bin/env node
/**
 * Seed Video Database Script
 *
 * Seeds the video database with demo videos.
 * Note: Requires auth database to be seeded first.
 *
 * Usage: npm run seed:video
 */
import { RefreshToken, User } from '@app/auth-db/entities';
import { Video, VideoView } from '@app/video-db/entities';
import { VideoSeeder } from '@app/video-db/seeders/video.seeder';
import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Load environment variables
config();

const AuthDataSource = new DataSource({
  type: 'postgres',
  host: process.env.AUTH_DB_HOST || 'localhost',
  port: parseInt(process.env.AUTH_DB_PORT) || 5432,
  username: process.env.AUTH_DB_USERNAME || 'postgres',
  password: process.env.AUTH_DB_PASSWORD || 'postgres',
  database: process.env.AUTH_DB_NAME || 'tiktok_auth',
  entities: [User, RefreshToken],
  synchronize: false,
  logging: false,
});

const VideoDataSource = new DataSource({
  type: 'postgres',
  host: process.env.VIDEO_DB_HOST || 'localhost',
  port: parseInt(process.env.VIDEO_DB_PORT) || 5433,
  username: process.env.VIDEO_DB_USERNAME || 'postgres',
  password: process.env.VIDEO_DB_PASSWORD || 'postgres',
  database: process.env.VIDEO_DB_NAME || 'tiktok_video',
  entities: [Video, VideoView],
  synchronize: false,
  logging: false,
});

async function seedVideo() {
  console.log('🚀 Starting Video database seeding...\n');

  try {
    await AuthDataSource.initialize();
    console.log('✅ Auth database connected');

    await VideoDataSource.initialize();
    console.log('✅ Video database connected\n');

    // Get existing users from auth database
    const userRepository = AuthDataSource.getRepository(User);
    const users = await userRepository.find();

    if (users.length === 0) {
      console.error('❌ No users found. Please run seed:auth first.');
      process.exit(1);
    }

    const seeder = new VideoSeeder(VideoDataSource);
    const videos = await seeder.seed(users.map((u) => ({ id: u.id, username: u.username })));

    console.log('\n📊 Seeded Videos:');
    videos.forEach((v) => console.log(`   - ${v.title}`));
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (AuthDataSource.isInitialized) await AuthDataSource.destroy();
    if (VideoDataSource.isInitialized) await VideoDataSource.destroy();
    console.log('\n👋 Done!');
  }
}

seedVideo();
