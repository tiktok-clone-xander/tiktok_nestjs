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

const logTransports: any[] = [
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  }),
];

// Only add file transports when explicitly enabled (disabled in production containers by default)
if (process.env.ENABLE_FILE_LOGGING === 'true') {
  const logDir = process.env.LOG_DIR || 'logs';
  let dirOk = true;
  try {
    fs.mkdirSync(path.resolve(logDir), { recursive: true });
  } catch (err: any) {
    dirOk = false;
    // eslint-disable-next-line no-console
    console.warn(`File logging disabled - cannot create log directory "${logDir}":`, err && err.message ? err.message : err);
  }
  if (dirOk) {
    logTransports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new DailyRotateFile({
        level: 'error',
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
      }),
    );
  }
}

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: logTransports,
});
