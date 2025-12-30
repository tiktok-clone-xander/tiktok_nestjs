#!/usr/bin/env node
/**
 * Sync All Database Schemas Script
 *
 * This script synchronizes all database schemas using TypeORM synchronize feature.
 * Use this in development only - NEVER in production!
 *
 * Usage: npm run db:sync
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

// Notification entities (if they exist)
let NotificationEntities: any[] = [];
async function loadNotificationEntities() {
  try {
    const notifModule = await import('@app/notification-db/entities');
    NotificationEntities = Object.values(notifModule).filter(
      (entity: any) => typeof entity === 'function',
    );
  } catch {
    console.log('No notification entities found, skipping...');
  }
}

// Create data sources for each database with synchronize enabled
const AuthDataSource = new DataSource({
  type: 'postgres',
  host: process.env.AUTH_DB_HOST || 'localhost',
  port: parseInt(process.env.AUTH_DB_PORT) || 5432,
  username: process.env.AUTH_DB_USERNAME || 'postgres',
  password: process.env.AUTH_DB_PASSWORD || 'postgres',
  database: process.env.AUTH_DB_NAME || 'tiktok_auth',
  entities: [User, RefreshToken],
  synchronize: true, // Will create/update tables
  logging: true,
});

const VideoDataSource = new DataSource({
  type: 'postgres',
  host: process.env.VIDEO_DB_HOST || 'localhost',
  port: parseInt(process.env.VIDEO_DB_PORT) || 5432,
  username: process.env.VIDEO_DB_USERNAME || 'postgres',
  password: process.env.VIDEO_DB_PASSWORD || 'postgres',
  database: process.env.VIDEO_DB_NAME || 'tiktok_video',
  entities: [Video, VideoView],
  synchronize: true,
  logging: true,
});

const InteractionDataSource = new DataSource({
  type: 'postgres',
  host: process.env.INTERACTION_DB_HOST || 'localhost',
  port: parseInt(process.env.INTERACTION_DB_PORT) || 5432,
  username: process.env.INTERACTION_DB_USERNAME || 'postgres',
  password: process.env.INTERACTION_DB_PASSWORD || 'postgres',
  database: process.env.INTERACTION_DB_NAME || 'tiktok_interaction',
  entities: [Like, Comment, CommentLike, Follow, Share],
  synchronize: true,
  logging: true,
});

const NotificationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NOTIFICATION_DB_HOST || 'localhost',
  port: parseInt(process.env.NOTIFICATION_DB_PORT) || 5432,
  username: process.env.NOTIFICATION_DB_USERNAME || 'postgres',
  password: process.env.NOTIFICATION_DB_PASSWORD || 'postgres',
  database: process.env.NOTIFICATION_DB_NAME || 'tiktok_notification',
  entities: NotificationEntities,
  synchronize: true,
  logging: true,
});

async function syncAll() {
  await loadNotificationEntities();
  console.log('🚀 Synchronizing all database schemas...\n');
  console.log('⚠️  WARNING: This should only be used in development!\n');

  try {
    // Sync Auth database
    console.log('━'.repeat(50));
    console.log('📦 Syncing Auth database...');
    await AuthDataSource.initialize();
    console.log('✅ Auth database schema synchronized\n');

    // Sync Video database
    console.log('━'.repeat(50));
    console.log('📦 Syncing Video database...');
    await VideoDataSource.initialize();
    console.log('✅ Video database schema synchronized\n');

    // Sync Interaction database
    console.log('━'.repeat(50));
    console.log('📦 Syncing Interaction database...');
    await InteractionDataSource.initialize();
    console.log('✅ Interaction database schema synchronized\n');

    // Sync Notification database
    console.log('━'.repeat(50));
    console.log('📦 Syncing Notification database...');
    if (NotificationEntities.length > 0) {
      await NotificationDataSource.initialize();
      console.log('✅ Notification database schema synchronized\n');
    } else {
      console.log('⏭️  Skipped (no entities)\n');
    }

    console.log('━'.repeat(50));
    console.log('');
    console.log('🎉 All database schemas synchronized successfully!');
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  } finally {
    // Close all connections
    console.log('\n🔌 Closing database connections...');
    if (AuthDataSource.isInitialized) await AuthDataSource.destroy();
    if (VideoDataSource.isInitialized) await VideoDataSource.destroy();
    if (InteractionDataSource.isInitialized) await InteractionDataSource.destroy();
    if (NotificationDataSource.isInitialized) await NotificationDataSource.destroy();
    console.log('👋 Done!');
  }
}

// Run the sync
syncAll();
