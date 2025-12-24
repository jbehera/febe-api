import winston from 'winston';
import { getRequestContext } from '../context/request-context';

// 1. Create a custom formatter to inject Context Data (Trace ID)
const contextInjector = winston.format((info) => {
  const context = getRequestContext();
  
  if (context) {
    // Add traceId to the log object
    info.traceId = context.traceId;
    
    // Optional: Add the user ID if you have it in your token
    // info.userId = context.userId; 
  }
  return info;
});

// 2. Define how the log should look (Console vs File)
const consoleFormat = winston.format.printf(({ level, message, timestamp, traceId, ...meta }) => {
  // If a traceId exists, put it in brackets [trace-id]
  const tracePrefix = traceId ? `[${traceId}]` : '';
  
  // Clean up meta object (remove internal winston keys) if you want to print extra data
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';

  return `${timestamp} ${level.toUpperCase()}: ${tracePrefix} ${message} ${metaString}`;
});

// 3. Create the Logger Instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Print stack trace for errors
    contextInjector() // <--- ACTIVATE OUR INJECTOR
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        consoleFormat
      ),
    }),
    // You can add File transports here for persistent logging
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});