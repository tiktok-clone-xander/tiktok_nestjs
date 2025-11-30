import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class DatabaseSetupService {
  private readonly logger = new Logger(DatabaseSetupService.name);

  constructor(private readonly configService: ConfigService) {}

  async ensureDatabaseExists(dbName: string, prefix: string): Promise<void> {
    const host = this.configService.get(`${prefix}_DB_HOST`, 'localhost');
    const port = this.configService.get(`${prefix}_DB_PORT`, 5432);
    const username = this.configService.get(`${prefix}_DB_USERNAME`, 'postgres');
    const password = this.configService.get(`${prefix}_DB_PASSWORD`, 'postgres');

    // Connect to postgres database to create the target database
    const client = new Client({
      host,
      port: parseInt(port.toString()),
      user: username,
      password,
      database: 'postgres', // Connect to default postgres database
    });

    try {
      await client.connect();
      this.logger.log(`Connected to PostgreSQL server for database ${dbName}`);

      // Check if database exists
      const checkDbQuery = 'SELECT 1 FROM pg_database WHERE datname = $1';
      const result = await client.query(checkDbQuery, [dbName]);

      if (result.rows.length === 0) {
        // Database doesn't exist, create it
        this.logger.log(`Creating database: ${dbName}`);
        await client.query(`CREATE DATABASE "${dbName}"`);
        this.logger.log(`✅ Database "${dbName}" created successfully`);
      } else {
        this.logger.log(`✅ Database "${dbName}" already exists`);
      }
    } catch (error) {
      this.logger.error(`❌ Error ensuring database ${dbName} exists:`, error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  async setupAllDatabases(): Promise<void> {
    const databases = [
      { name: this.configService.get('AUTH_DB_NAME', 'tiktok_auth'), prefix: 'AUTH' },
      { name: this.configService.get('VIDEO_DB_NAME', 'tiktok_video'), prefix: 'VIDEO' },
      {
        name: this.configService.get('INTERACTION_DB_NAME', 'tiktok_interaction'),
        prefix: 'INTERACTION',
      },
      {
        name: this.configService.get('NOTIFICATION_DB_NAME', 'tiktok_notification'),
        prefix: 'NOTIFICATION',
      },
    ];

    this.logger.log('🔧 Setting up all databases...');

    for (const db of databases) {
      try {
        await this.ensureDatabaseExists(db.name, db.prefix);
      } catch (error) {
        this.logger.error(`Failed to setup database ${db.name}:`, error.message);
        throw error;
      }
    }

    this.logger.log('🎉 All databases setup completed successfully!');
  }
}
