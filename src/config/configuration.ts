export default () => ({
  // Application Configuration
  app: {
    clientUrl: process.env.CLIENT_URL,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT as string, 10),
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(','),
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT Configuration
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    secret: process.env.JWT_SECRET,
  },

  // Rate Limiting Configuration
  rateLimit: {
    limit: parseInt(process.env.RATE_LIMIT_LIMIT as string, 10),
    ttl: parseInt(process.env.RATE_LIMIT_TTL as string, 10),
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE as string, 10),
    uploadPath: process.env.UPLOAD_PATH,
  },
});
