import { DatabaseSetupService } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment, CommentLike, Follow, Like, Share } from './entities';

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
            configService.get('INTERACTION_DB_NAME', 'tiktok_interaction'),
            'INTERACTION',
          );
        } catch (error) {
          console.warn('Database auto-setup failed:', error.message);
        }

        return {
          type: 'postgres',
          host: configService.get('INTERACTION_DB_HOST', 'localhost'),
          port: configService.get('INTERACTION_DB_PORT', 5432),
          username: configService.get('INTERACTION_DB_USERNAME', 'postgres'),
          password: configService.get('INTERACTION_DB_PASSWORD', 'postgres'),
          database: configService.get('INTERACTION_DB_NAME', 'tiktok_interaction'),
          entities: [Like, Comment, CommentLike, Follow, Share],
          synchronize:
            configService.get('NODE_ENV') === 'development' &&
            configService.get('INTERACTION_DB_SYNC', 'false') === 'true',
          migrationsRun: configService.get('NODE_ENV') === 'production',
          logging: configService.get('NODE_ENV') === 'development',
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Like, Comment, CommentLike, Follow, Share]),
  ],
  providers: [DatabaseSetupService],
  exports: [TypeOrmModule],
})
export class InteractionDbModule {}
