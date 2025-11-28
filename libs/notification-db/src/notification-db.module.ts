import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationDelivery, NotificationPreference } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('NOTIFICATION_DB_HOST', 'localhost'),
        port: configService.get('NOTIFICATION_DB_PORT', 5435),
        username: configService.get('NOTIFICATION_DB_USERNAME', 'postgres'),
        password: configService.get('NOTIFICATION_DB_PASSWORD', 'postgres'),
        database: configService.get('NOTIFICATION_DB_NAME', 'tiktok_notification'),
        entities: [Notification, NotificationDelivery, NotificationPreference],
        synchronize:
          configService.get('NODE_ENV') === 'development' &&
          configService.get('NOTIFICATION_DB_SYNC', 'false') === 'true',
        migrationsRun: configService.get('NODE_ENV') === 'production',
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Notification, NotificationDelivery, NotificationPreference]),
  ],
  exports: [TypeOrmModule],
})
export class NotificationDbModule {}
