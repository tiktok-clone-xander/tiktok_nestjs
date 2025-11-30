import { DatabaseSetupService } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video, VideoView } from './entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Auto-setup database if needed
        try {
          const dbSetupService = new DatabaseSetupService(configService);
          await dbSetupService.ensureDatabaseExists(
            configService.get('VIDEO_DB_NAME', 'tiktok_video'),
            'VIDEO',
          );
        } catch (error) {
          console.warn('Database auto-setup failed:', error.message);
        }

        return {
          type: 'postgres',
          host: configService.get('VIDEO_DB_HOST', 'localhost'),
          port: configService.get('VIDEO_DB_PORT', 5432),
          username: configService.get('VIDEO_DB_USERNAME', 'postgres'),
          password: configService.get('VIDEO_DB_PASSWORD', 'postgres'),
          database: configService.get('VIDEO_DB_NAME', 'tiktok_video'),
          entities: [Video, VideoView],
          synchronize:
            configService.get('NODE_ENV') === 'development' &&
            configService.get('VIDEO_DB_SYNC', 'false') === 'true',
          migrationsRun: configService.get('NODE_ENV') === 'production',
          logging: configService.get('NODE_ENV') === 'development',
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Video, VideoView]),
  ],
  providers: [DatabaseSetupService],
  exports: [TypeOrmModule],
})
export class VideoDbModule {}
