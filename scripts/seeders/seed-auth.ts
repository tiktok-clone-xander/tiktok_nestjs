#!/usr/bin/env node
/**
 * Seed Auth Database Script
 *
 * Seeds only the auth database with demo users.
 *
 * Usage: npm run seed:auth
 */
import { RefreshToken, User } from '@app/auth-db/entities';
import { AuthSeeder } from '@app/auth-db/seeders/auth.seeder';
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

async function seedAuth() {
  console.log('🚀 Starting Auth database seeding...\n');

  try {
    await AuthDataSource.initialize();
    console.log('✅ Auth database connected\n');

    const seeder = new AuthSeeder(AuthDataSource);
    const users = await seeder.seed();

    console.log('\n📊 Seeded Users:');
    users.forEach((u) => console.log(`   - ${u.email}`));
    console.log('\n🔑 Password for all users: Password123!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (AuthDataSource.isInitialized) await AuthDataSource.destroy();
    console.log('\n👋 Done!');
  }
}

seedAuth();
