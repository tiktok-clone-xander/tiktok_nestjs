import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KmsModule } from '../kms';
import { SentryService } from './sentry.service';

@Global()
@Module({
  imports: [ConfigModule, KmsModule],
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {}
