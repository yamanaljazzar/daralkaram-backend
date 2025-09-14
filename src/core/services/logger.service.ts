import { join } from 'path';
import { mkdirSync, existsSync, createWriteStream } from 'fs';

import { ConfigService } from '@nestjs/config';
import { Inject, Optional, Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

import { getLoggerConfig } from '@/config/logger.config';

/**
 * Log levels enum for better type safety
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  LOG = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

/**
 * Log entry interface for structured logging
 */
export interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  data?: unknown;
  trace?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: LogLevel;
  enableFileLogging: boolean;
  logDirectory: string;
  maxFileSize: number;
  maxFiles: number;
  enableStructuredLogging: boolean;
  enablePerformanceLogging: boolean;
}

/**
 * Enhanced Logger Service with advanced features
 * Supports structured logging, file logging, performance tracking, and more
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;
  private config: LoggerConfig;
  private logStream?: NodeJS.WritableStream;
  private performanceTimers: Map<string, number> = new Map();

  constructor(
    @Optional() @Inject('LOGGER_CONTEXT') context?: string,
    private readonly configService?: ConfigService,
  ) {
    this.context = context;
    this.config = this.loadConfig();
    this.initializeFileLogging();
  }

  /**
   * Load logger configuration from config file and environment-specific settings
   */
  private loadConfig(): LoggerConfig {
    const config = getLoggerConfig();

    return {
      enableFileLogging: config.enableFileLogging,
      enablePerformanceLogging: config.enablePerformanceLogging,
      enableStructuredLogging: config.enableStructuredLogging,
      level: this.getLogLevel(config.level),
      logDirectory: config.logDirectory,
      maxFiles: config.maxFiles,
      maxFileSize: config.maxFileSize,
    };
  }

  /**
   * Convert string log level to enum
   */
  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'log':
        return LogLevel.LOG;
      case 'debug':
        return LogLevel.DEBUG;
      case 'verbose':
        return LogLevel.VERBOSE;
      default:
        return LogLevel.LOG;
    }
  }

  /**
   * Initialize file logging if enabled
   */
  private initializeFileLogging(): void {
    if (!this.config.enableFileLogging) return;

    try {
      // Create logs directory if it doesn't exist
      if (!existsSync(this.config.logDirectory)) {
        mkdirSync(this.config.logDirectory, { recursive: true });
      }

      const logFile = join(
        this.config.logDirectory,
        `app-${new Date().toISOString().split('T')[0]}.log`,
      );
      this.logStream = createWriteStream(logFile, { flags: 'a' });
    } catch (error) {
      console.error('Failed to initialize file logging:', error);
    }
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: string,
    message: string,
    context?: string,
    data?: unknown,
    trace?: string,
    metadata?: Record<string, any>,
  ): LogEntry {
    return {
      context: this.context || context || 'APP',
      data,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
      trace,
    };
  }

  /**
   * Write log entry to console and/or file
   */
  private writeLog(entry: LogEntry): void {
    const logMessage = this.config.enableStructuredLogging
      ? JSON.stringify(entry)
      : `[${entry.timestamp}] [${entry.level}] [${entry.context}] ${entry.message}`;

    // Console output
    switch (entry.level.toLowerCase()) {
      case 'error':
        console.error(logMessage);
        if (entry.trace) {
          console.error(`[${entry.context}] TRACE: ${entry.trace}`);
        }
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    // File output
    if (this.logStream && this.config.enableFileLogging) {
      this.logStream.write(logMessage + '\n');
    }
  }

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  /**
   * Standard log method
   */
  log(message: any, context?: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.LOG)) return;

    const entry = this.createLogEntry('LOG', String(message), context, data);
    this.writeLog(entry);
  }

  /**
   * Error log method with optional trace and metadata
   */
  error(message: any, trace?: string, context?: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(
      'ERROR',
      String(message),
      context,
      undefined,
      trace,
      metadata,
    );
    this.writeLog(entry);
  }

  /**
   * Warning log method
   */
  warn(message: any, context?: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry('WARN', String(message), context, data);
    this.writeLog(entry);
  }

  /**
   * Debug log method (only in development)
   */
  debug(message: any, context?: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry('DEBUG', String(message), context, data);
    this.writeLog(entry);
  }

  /**
   * Verbose log method (only in development)
   */
  verbose(message: any, context?: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.VERBOSE)) return;

    const entry = this.createLogEntry('VERBOSE', String(message), context, data);
    this.writeLog(entry);
  }

  /**
   * Log with custom level
   */
  logWithLevel(level: LogLevel, message: any, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const levelName = LogLevel[level];
    const entry = this.createLogEntry(levelName, String(message), context, data);
    this.writeLog(entry);
  }

  /**
   * Start performance timer
   */
  startTimer(operation: string): void {
    if (!this.config.enablePerformanceLogging) return;
    this.performanceTimers.set(operation, Date.now());
  }

  /**
   * End performance timer and log duration
   */
  endTimer(operation: string, context?: string): void {
    if (!this.config.enablePerformanceLogging) return;

    const startTime = this.performanceTimers.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.performanceTimers.delete(operation);

      const entry = this.createLogEntry(
        'PERF',
        `Operation '${operation}' completed`,
        context,
        undefined,
        undefined,
        {
          duration,
          durationMs: duration,
          operation,
        },
      );
      this.writeLog(entry);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    const entry = this.createLogEntry(
      'HTTP',
      `${method} ${url} ${statusCode}`,
      context,
      undefined,
      undefined,
      {
        duration,
        method,
        statusCode,
        url,
        ...metadata,
      },
    );
    this.writeLog(entry);
  }

  /**
   * Log database operation
   */
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    const entry = this.createLogEntry(
      'DB',
      `${operation} on ${table}`,
      context,
      undefined,
      undefined,
      {
        duration,
        operation,
        table,
        ...metadata,
      },
    );
    this.writeLog(entry);
  }

  /**
   * Log authentication event
   */
  logAuth(event: string, userId?: string, context?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('AUTH', event, context, undefined, undefined, {
      event,
      userId,
      ...metadata,
    });
    this.writeLog(entry);
  }

  /**
   * Log business logic event
   */
  logBusiness(
    event: string,
    context?: string,
    data?: unknown,
    metadata?: Record<string, any>,
  ): void {
    const entry = this.createLogEntry('BUSINESS', event, context, data, undefined, metadata);
    this.writeLog(entry);
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Update log level at runtime
   */
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Close file stream on application shutdown
   */
  close(): void {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}
