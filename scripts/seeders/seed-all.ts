#!/usr/bin/env node
/**
 * Seed All Databases Script
 *
 * This script seeds all microservice databases with demo data.
 * It seeds in the correct order: Auth -> Video -> Interaction
 *
 * Usage: npm run seed:all
 */
import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Load environment variables
config();

// Import entities
import { RefreshToken, User } from '@app/auth-db/entities';
import { Comment, CommentLike, Follow, Like, Share } from '@app/interaction-db/entities';
import { Video, VideoView } from '@app/video-db/entities';

// Import seeders
import { AuthSeeder } from '@app/auth-db/seeders/auth.seeder';
import { InteractionSeeder } from '@app/interaction-db/seeders/interaction.seeder';
import { VideoSeeder } from '@app/video-db/seeders/video.seeder';

// Create data sources for each database
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

async function seedAll() {
  console.log('🚀 Starting comprehensive database seeding...\n');
  console.log('📋 Database Configuration:');
  console.log(
    `   Auth DB: ${process.env.AUTH_DB_HOST || 'localhost'}:${process.env.AUTH_DB_PORT || 5432}/${process.env.AUTH_DB_NAME || 'tiktok_auth'}`,
  );
  console.log(
    `   Video DB: ${process.env.VIDEO_DB_HOST || 'localhost'}:${process.env.VIDEO_DB_PORT || 5433}/${process.env.VIDEO_DB_NAME || 'tiktok_video'}`,
  );
  console.log(
    `   Interaction DB: ${process.env.INTERACTION_DB_HOST || 'localhost'}:${process.env.INTERACTION_DB_PORT || 5434}/${process.env.INTERACTION_DB_NAME || 'tiktok_interaction'}`,
  );
  console.log('');

  try {
    // Initialize all data sources
    console.log('🔌 Initializing database connections...');
    await AuthDataSource.initialize();
    console.log('   ✅ Auth database connected');

    await VideoDataSource.initialize();
    console.log('   ✅ Video database connected');

    await InteractionDataSource.initialize();
    console.log('   ✅ Interaction database connected');
    console.log('');

    // 1. Seed Auth database first (users are required by other services)
    console.log('━'.repeat(50));
    const authSeeder = new AuthSeeder(AuthDataSource);
    const users = await authSeeder.seed();
    console.log('');

    // 2. Seed Video database (requires users)
    console.log('━'.repeat(50));
    const videoSeeder = new VideoSeeder(VideoDataSource);
    const videos = await videoSeeder.seed(users.map((u) => ({ id: u.id, username: u.username })));
    console.log('');

    // 3. Seed Interaction database (requires users and videos)
    console.log('━'.repeat(50));
    const interactionSeeder = new InteractionSeeder(InteractionDataSource);
    await interactionSeeder.seed(
      users.map((u) => ({ id: u.id, username: u.username })),
      videos,
    );
    console.log('');

    console.log('━'.repeat(50));
    console.log('');
    console.log('🎉 All databases seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   🎬 Videos: ${videos.length}`);
    console.log('   💬 Comments, Likes, Follows: Created');
    console.log('');
    console.log('🔑 Demo Credentials:');
    console.log('   Email: demo@tiktok.local');
    console.log('   Password: Password123!');
    console.log('');
    console.log('   Or use any of the other test users:');
    users.slice(0, 3).forEach((u) => {
      console.log(`   - ${u.email} / Password123!`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close all connections
    console.log('🔌 Closing database connections...');
    if (AuthDataSource.isInitialized) await AuthDataSource.destroy();
    if (VideoDataSource.isInitialized) await VideoDataSource.destroy();
    if (InteractionDataSource.isInitialized) await InteractionDataSource.destroy();
    console.log('👋 Done!');
  }
}

// Run the seeder
seedAll();
