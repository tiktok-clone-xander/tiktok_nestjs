import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      this.logger.log('RabbitMQ connected successfully');

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publishMessage(queue: string, message: any): Promise<boolean> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } catch (error) {
      this.logger.error(`Failed to publish message to ${queue}`, error);
      throw error;
    }
  }

  async consumeMessages(
    queue: string,
    callback: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.prefetch(1);

      this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              await callback(content);
              this.channel.ack(msg);
            } catch (error) {
              this.logger.error('Error processing message', error);
              this.channel.nack(msg, false, false);
            }
          }
        },
        { noAck: false },
      );

      this.logger.log(`Started consuming messages from ${queue}`);
    } catch (error) {
      this.logger.error(`Failed to consume messages from ${queue}`, error);
      throw error;
    }
  }

  async publish(exchange: string, message: any): Promise<void> {
    try {
      await this.channel.assertExchange(exchange, 'fanout', { durable: true });
      this.channel.publish(
        exchange,
        '',
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
      this.logger.log(`Published message to exchange ${exchange}`);
    } catch (error) {
      this.logger.error(`Failed to publish to exchange ${exchange}`, error);
      throw error;
    }
  }

  async subscribe(
    exchange: string,
    callback: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      await this.channel.assertExchange(exchange, 'fanout', { durable: true });
      const { queue } = await this.channel.assertQueue('', { exclusive: true });
      await this.channel.bindQueue(queue, exchange, '');

      this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              await callback(content);
              this.channel.ack(msg);
            } catch (error) {
              this.logger.error('Error processing subscribed message', error);
              this.channel.nack(msg, false, false);
            }
          }
        },
        { noAck: false },
      );

      this.logger.log(`Subscribed to exchange ${exchange}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to exchange ${exchange}`, error);
      throw error;
    }
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }
}
