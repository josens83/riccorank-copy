import pino from 'pino';

// Create logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Production settings
  ...(process.env.NODE_ENV === 'production'
    ? {
        // JSON format for production
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      }
    : {
        // Pretty print for development
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
      }),

  // Base configuration
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA,
  },

  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.secret',
    ],
    remove: true,
  },

  // Error serialization
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// Helper functions for structured logging
export const log = {
  // Debug level
  debug: (msg: string, data?: object) => {
    logger.debug(data, msg);
  },

  // Info level
  info: (msg: string, data?: object) => {
    logger.info(data, msg);
  },

  // Warning level
  warn: (msg: string, data?: object) => {
    logger.warn(data, msg);
  },

  // Error level
  error: (msg: string, error?: Error | unknown, data?: object) => {
    if (error instanceof Error) {
      logger.error({ err: error, ...data }, msg);
    } else {
      logger.error({ error, ...data }, msg);
    }
  },

  // Fatal level
  fatal: (msg: string, error?: Error | unknown, data?: object) => {
    if (error instanceof Error) {
      logger.fatal({ err: error, ...data }, msg);
    } else {
      logger.fatal({ error, ...data }, msg);
    }
  },

  // Custom context logger
  child: (context: object) => {
    return logger.child(context);
  },
};

// Request logging middleware helper
export function createRequestLogger(context: {
  method?: string;
  url?: string;
  userId?: string;
  requestId?: string;
}) {
  return logger.child({
    requestId: context.requestId || generateRequestId(),
    method: context.method,
    url: context.url,
    userId: context.userId,
  });
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Export default logger
export default logger;

// Export types
export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof logger.child>;
