import { DatabaseSetupService } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, User } from './entities';

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
            configService.get('AUTH_DB_NAME', 'tiktok_auth'),
            'AUTH',
          );
        } catch (error) {
          console.warn('Database auto-setup failed:', error.message);
        }

        return {
          type: 'postgres',
          host: configService.get('AUTH_DB_HOST', 'localhost'),
          port: configService.get('AUTH_DB_PORT', 5432),
          username: configService.get('AUTH_DB_USERNAME', 'postgres'),
          password: configService.get('AUTH_DB_PASSWORD', 'postgres'),
          database: configService.get('AUTH_DB_NAME', 'tiktok_auth'),
          entities: [User, RefreshToken],
          synchronize:
            configService.get('NODE_ENV') === 'development' &&
            configService.get('AUTH_DB_SYNC', 'false') === 'true',
          migrationsRun: configService.get('NODE_ENV') === 'production',
          logging: configService.get('NODE_ENV') === 'development',
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  providers: [DatabaseSetupService],
  exports: [TypeOrmModule],
})
export class AuthDbModule {}
