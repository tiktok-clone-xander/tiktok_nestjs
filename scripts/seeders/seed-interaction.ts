#!/usr/bin/env node
/**
 * Seed Interaction Database Script
 *
 * Seeds the interaction database with demo likes, comments, follows.
 * Note: Requires auth and video databases to be seeded first.
 *
 * Usage: npm run seed:interaction
 */
import { RefreshToken, User } from '@app/auth-db/entities';
import { Comment, CommentLike, Follow, Like, Share } from '@app/interaction-db/entities';
import { InteractionSeeder } from '@app/interaction-db/seeders/interaction.seeder';
import { Video, VideoView } from '@app/video-db/entities';
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

const InteractionDataSource = new DataSource({
  type: 'postgres',
  host: process.env.INTERACTION_DB_HOST || 'localhost',
  port: parseInt(process.env.INTERACTION_DB_PORT) || 5434,
  username: process.env.INTERACTION_DB_USERNAME || 'postgres',
  password: process.env.INTERACTION_DB_PASSWORD || 'postgres',
  database: process.env.INTERACTION_DB_NAME || 'tiktok_interaction',
  entities: [Like, Comment, CommentLike, Follow, Share],
  synchronize: false,
  logging: false,
});

async function seedInteraction() {
  console.log('🚀 Starting Interaction database seeding...\n');

  try {
    await AuthDataSource.initialize();
    console.log('✅ Auth database connected');

    await VideoDataSource.initialize();
    console.log('✅ Video database connected');

    await InteractionDataSource.initialize();
    console.log('✅ Interaction database connected\n');

    // Get existing users from auth database
    const userRepository = AuthDataSource.getRepository(User);
    const users = await userRepository.find();

    if (users.length === 0) {
      console.error('❌ No users found. Please run seed:auth first.');
      process.exit(1);
    }

    // Get existing videos from video database
    const videoRepository = VideoDataSource.getRepository(Video);
    const videos = await videoRepository.find();

    if (videos.length === 0) {
      console.error('❌ No videos found. Please run seed:video first.');
      process.exit(1);
    }

    const seeder = new InteractionSeeder(InteractionDataSource);
    await seeder.seed(
      users.map((u) => ({ id: u.id, username: u.username })),
      videos.map((v) => ({ id: v.id, userId: v.userId, title: v.title })),
    );

    console.log('\n📊 Interactions seeded successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (AuthDataSource.isInitialized) await AuthDataSource.destroy();
    if (VideoDataSource.isInitialized) await VideoDataSource.destroy();
    if (InteractionDataSource.isInitialized) await InteractionDataSource.destroy();
    console.log('\n👋 Done!');
  }
}

seedInteraction();
