import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
// Disable Elasticsearch transport due to incompatibility issues
// import ElasticsearchTransport from 'winston-elasticsearch';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context: string;

  constructor(private configService: ConfigService) {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const logLevel = this.configService.get('LOG_LEVEL', isProduction ? 'info' : 'debug');
    const _elasticsearchNode = this.configService.get('ELASTICSEARCH_NODE');

    const transports: winston.transport[] = [];

    // Console transport
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `[${timestamp}] [${level}]: ${message} ${metaStr}`;
          }),
        ),
      }),
    );

    // File rotation transport
    transports.push(
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    );

    // Error file rotation
    transports.push(
      new DailyRotateFile({
        level: 'error',
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    );

    // Elasticsearch transport - disabled due to incompatibility
    // if (elasticsearchNode) {
    //   transports.push(
    //     new ElasticsearchTransport({
    //       level: logLevel,
    //       clientOpts: {
    //         node: elasticsearchNode,
    //         auth: {
    //           username: this.configService.get('ELASTICSEARCH_USER', 'elastic'),
    //           password: this.configService.get('ELASTICSEARCH_PASSWORD', 'changeme'),
    //         },
    //       },
    //       index: 'logs-tiktok',
    //       dataStream: true,
    //       transformer: (logData) => {
    //         return {
    //           '@timestamp': new Date().toISOString(),
    //           message: logData.message,
    //           severity: logData.level,
    //           fields: logData.meta,
    //         };
    //       },
    //     } as any),
    //   );
    // }

    return winston.createLogger({
      level: logLevel,
      transports,
      exceptionHandlers: transports,
      rejectionHandlers: transports,
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, {
      context: this.context,
      ...meta,
    });
  }

  error(message: string, trace?: any, meta?: any): void {
    this.logger.error(message, {
      context: this.context,
      stack: trace,
      ...meta,
    });
  }

  log(message: string, meta?: any): void {
    this.logger.info(message, {
      context: this.context,
      ...meta,
    });
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, {
      context: this.context,
      ...meta,
    });
  }

  verbose(message: string, meta?: any): void {
    this.logger.debug(message, {
      context: this.context,
      level: 'verbose',
      ...meta,
    });
  }
}
