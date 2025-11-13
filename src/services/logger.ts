/**
 * Logger Service
 *
 * Centralized logging utility that:
 * - Only logs in development mode (__DEV__)
 * - Provides consistent logging interface
 * - Can be extended to send logs to external services (Sentry, LogRocket, etc.)
 * - Improves performance in production by avoiding console calls
 *
 * Usage:
 * import { logger } from '../services/logger';
 *
 * logger.log('User action', { userId: 123 });
 * logger.error('Failed to save', error);
 * logger.warn('Deprecated function');
 * logger.info('App initialized');
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = __DEV__;
  }

  /**
   * General logging - only in development
   */
  log(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      if (metadata) {
        console.log(message, metadata);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Informational messages - only in development
   */
  info(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      if (metadata) {
        console.info(`ℹ️ ${message}`, metadata);
      } else {
        console.info(`ℹ️ ${message}`);
      }
    }
  }

  /**
   * Warning messages - only in development
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      if (metadata) {
        console.warn(`⚠️ ${message}`, metadata);
      } else {
        console.warn(`⚠️ ${message}`);
      }
    }
  }

  /**
   * Error logging - logs in both dev and production
   * In production, these should be sent to error tracking service
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error, metadata);
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureException(error, { extra: { message, ...metadata } });

      // For now, we'll silently fail in production but you should add
      // error tracking here (Sentry, Bugsnag, etc.)
    }
  }

  /**
   * Debug messages - only in development
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      if (metadata) {
        console.debug(`🐛 ${message}`, metadata);
      } else {
        console.debug(`🐛 ${message}`);
      }
    }
  }

  /**
   * Success messages - only in development
   */
  success(message: string, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      if (metadata) {
        console.log(`✅ ${message}`, metadata);
      } else {
        console.log(`✅ ${message}`);
      }
    }
  }

  /**
   * Performance timing - only in development
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Group related logs - only in development
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Table output for arrays/objects - only in development
   */
  table(data: any): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for testing/mocking purposes
export type { LogMetadata };
