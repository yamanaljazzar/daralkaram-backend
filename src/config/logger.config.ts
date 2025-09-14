export const loggerConfig = {
  enableFileLogging: process.env.LOG_FILE_ENABLED === 'true',

  enablePerformanceLogging: process.env.LOG_PERFORMANCE === 'true',

  enableStructuredLogging: process.env.LOG_STRUCTURED === 'true',

  level: process.env.LOG_LEVEL || 'log',

  logDirectory: process.env.LOG_DIRECTORY || './logs',

  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),

  maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'),
};

export const loggerEnvironments = {
  development: {
    enableFileLogging: true,
    enablePerformanceLogging: true,
    enableStructuredLogging: false,
    level: 'debug',
  },

  production: {
    enableFileLogging: true,
    enablePerformanceLogging: false,
    enableStructuredLogging: true,
    level: 'warn',
  },

  staging: {
    enableFileLogging: true,
    enablePerformanceLogging: true,
    enableStructuredLogging: true,
    level: 'log',
  },

  test: {
    enableFileLogging: false,
    enablePerformanceLogging: false,
    enableStructuredLogging: false,
    level: 'error',
  },
};

export function getLoggerConfig() {
  const currentEnv = process.env.NODE_ENV || 'development';
  const envConfig =
    loggerEnvironments[currentEnv as keyof typeof loggerEnvironments] ||
    loggerEnvironments.development;

  return {
    ...loggerConfig,
    ...envConfig,
  };
}
