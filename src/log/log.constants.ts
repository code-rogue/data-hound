import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const {colorize, combine, errors, json, printf, splat, timestamp } = winston.format;
const consoleFormat = printf( ({ level, message, timestamp}) => {
  return `${timestamp} [${level}] : ${message} `  
});

const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});

export const logFileTransport = new DailyRotateFile({
    dirname: 'logs',
    filename: 'application-%DATE%.log',
    format: combine(timestamp(), json()),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '2d',
  });
  
  export const errorFileTransport = new DailyRotateFile({
    datePattern: 'YYYY-MM-DD',
    dirname: 'logs',
    filename: 'error-%DATE%.log',
    format: combine(errors({ stack: true }), errorFilter(), timestamp(), json()),
    maxFiles: '2d',
    maxSize: '20m',
    zippedArchive: true,
  });

  export const consoleTransport = new winston.transports.Console({
    format: combine(
      errors({ stack: true }),
      colorize( { all: true } ),
      splat(),
      timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
      consoleFormat,
    ),
  });