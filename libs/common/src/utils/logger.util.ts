import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// File logging: attempt to create the directory and add rotate-file transports
const logDir = process.env.LOG_DIR || 'logs';
let fileLoggingEnabled = true;
try {
  fs.mkdirSync(path.resolve(logDir), { recursive: true });
} catch (err: unknown) {
  fileLoggingEnabled = false;
  // eslint-disable-next-line no-console
  console.warn(
    `File logging disabled - cannot create log directory "${logDir}"`,
    err instanceof Error ? err.message : String(err),
  );
}

if (fileLoggingEnabled) {
  logger.add(
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  );
  logger.add(
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  );
}
