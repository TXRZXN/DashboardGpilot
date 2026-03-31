/**
 * Structured Logger for Frontend
 * Follows Global Rule #5 (Observability)
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private readonly serviceName: string;

  constructor(service: string) {
    this.serviceName = service;
  }

  private formatMessage(level: LogLevel, message: string, context: LogContext = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...context,
    };

    // In development, we use pretty print for better DX
    if (process.env.NODE_ENV === 'development') {
      const color = this.getLevelColor(level);
      console.log(
        `%c[${timestamp}] [${level}] [${this.serviceName}]: ${message}`,
        `color: ${color}; font-weight: bold;`,
        context
      );
    } else {
      // In production, we log as JSON for monitoring systems
      console.log(JSON.stringify(logData));
    }
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'DEBUG': return '#808080'; // Gray
      case 'INFO':  return '#00FF00'; // Green
      case 'WARN':  return '#FFA500'; // Orange
      case 'ERROR': return '#FF0000'; // Red
      default:      return '#FFFFFF';
    }
  }

  debug(message: string, context?: LogContext) {
    this.formatMessage('DEBUG', message, context);
  }

  info(message: string, context?: LogContext) {
    this.formatMessage('INFO', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.formatMessage('WARN', message, context);
  }

  error(message: string, error?: Error | string, context?: LogContext) {
    const errorMsg = error instanceof Error ? error.message : (error || 'Unknown Error');
    const stack = error instanceof Error ? error.stack : undefined;
    
    this.formatMessage('ERROR', message, {
      ...context,
      errorMessage: errorMsg,
      stack,
    });
  }
}

// Global logger instance for general use
export const logger = new Logger('Frontend');

// Function to create feature-specific loggers
export const createLogger = (serviceName: string) => new Logger(serviceName);
