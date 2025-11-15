import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';

interface RabbitMQModuleOptions {
  name: string;
}

@Global()
@Module({})
export class RabbitMQModule {
  static register(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'RABBITMQ_OPTIONS',
          useValue: options,
        },
        RabbitMQService,
      ],
      exports: [RabbitMQService],
    };
  }
}
