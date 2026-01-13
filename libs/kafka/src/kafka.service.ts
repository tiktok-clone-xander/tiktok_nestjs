import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, EachMessagePayload, Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly consumerCallbacks = new Map<string, (message: unknown) => Promise<void>>();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const brokers = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(',');
      const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'tiktok-service');

      this.kafka = new Kafka({
        clientId,
        brokers,
        retry: {
          initialRetryTime: 100,
          retries: 3,
          multiplier: 2,
          maxRetryTime: 3000,
        },
        connectionTimeout: 3000,
        requestTimeout: 3000,
      });

      this.producer = this.kafka.producer({
        retry: {
          initialRetryTime: 100,
          retries: 3,
        },
      });

      // Connect with timeout
      await Promise.race([
        this.producer.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Kafka producer connection timeout')), 10000),
        ),
      ]);
      this.logger.log('Kafka producer connected successfully');

      // Create consumer with unique group ID per service
      const groupId = this.configService.get<string>('KAFKA_GROUP_ID', `${clientId}-group`);
      this.consumer = this.kafka.consumer({ groupId });

      await Promise.race([
        this.consumer.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Kafka consumer connection timeout')), 10000),
        ),
      ]);
      this.logger.log('Kafka consumer connected successfully');

      this.kafka.logger().setLogLevel(1); // ERROR level
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
      this.logger.warn('Application will continue without Kafka functionality');
      // Don't throw - allow app to start without Kafka
      this.producer = null;
      this.consumer = null;
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    }
    if (this.consumer) {
      await this.consumer.disconnect();
      this.logger.log('Kafka consumer disconnected');
    }
  }

  /**
   * Publish a message to a Kafka topic
   * @param topic - Kafka topic name
   * @param message - Message payload
   */
  async publish(topic: string, message: unknown): Promise<void> {
    if (!this.producer) {
      this.logger.warn(`Kafka not connected, skipping publish to topic ${topic}`);
      return;
    }
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.log(`Published message to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Publish a message with a key (for partitioning)
   * @param topic - Kafka topic name
   * @param key - Message key (determines partition)
   * @param message - Message payload
   */
  async publishWithKey(topic: string, key: string, message: unknown): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.log(`Published message with key ${key} to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a Kafka topic
   * @param topic - Kafka topic name
   * @param callback - Function to handle received messages
   */
  async subscribe(topic: string, callback: (message: unknown) => Promise<void>): Promise<void> {
    if (!this.consumer) {
      this.logger.warn(`Kafka not connected, skipping subscription to topic ${topic}`);
      return;
    }
    try {
      // Store the callback
      this.consumerCallbacks.set(topic, callback);

      // Subscribe to the topic
      await this.consumer.subscribe({ topic, fromBeginning: false });

      // Start consuming (consumer will handle multiple subscriptions)
      // Only start if not already running
      if (!this.consumerRunning) {
        await this.startConsumer();
      }

      this.logger.log(`Subscribed to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Start the Kafka consumer (idempotent)
   */
  private consumerRunning = false;
  private async startConsumer(): Promise<void> {
    if (this.consumerRunning) return;

    this.consumerRunning = true;
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, message } = payload;
        const callback = this.consumerCallbacks.get(topic);

        if (callback) {
          try {
            const value = JSON.parse(message.value?.toString() || '{}');
            await callback(value);
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}`, error);
          }
        }
      },
    });
  }

  /**
   * Subscribe to multiple topics
   * @param topics - Array of topic names
   * @param callback - Function to handle received messages
   */
  async subscribeToTopics(
    topics: string[],
    callback: (topic: string, message: unknown) => Promise<void>,
  ): Promise<void> {
    try {
      for (const topic of topics) {
        this.consumerCallbacks.set(topic, async (message) => {
          await callback(topic, message);
        });
      }

      await this.consumer.subscribe({ topics, fromBeginning: false });

      // Start consuming (consumer will handle multiple subscriptions)
      await this.startConsumer();

      this.logger.log(`Subscribed to topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to subscribe to topics', error);
      throw error;
    }
  }

  /**
   * Send message to a specific partition
   * @param topic - Kafka topic name
   * @param partition - Partition number
   * @param message - Message payload
   */
  async publishToPartition(topic: string, partition: number, message: unknown): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            partition,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.log(`Published message to topic ${topic} partition ${partition}`);
    } catch (error) {
      this.logger.error(`Failed to publish to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Get Kafka instance for advanced usage
   */
  getKafka(): Kafka {
    return this.kafka;
  }

  /**
   * Get producer instance
   */
  getProducer(): Producer {
    return this.producer;
  }

  /**
   * Get consumer instance
   */
  getConsumer(): Consumer {
    return this.consumer;
  }
}
