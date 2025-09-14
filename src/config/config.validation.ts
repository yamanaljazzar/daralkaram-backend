/* eslint-disable perfectionist/sort-objects */
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application Configuration
  CLIENT_URL: Joi.string(),
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'staging').default('development'),

  // Database Configuration
  DATABASE_URL: Joi.string().required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  // File Upload Configuration
  UPLOAD_PATH: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().required(),

  // CORS Configuration
  CORS_ORIGIN: Joi.string(),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().required(),
  RATE_LIMIT_LIMIT: Joi.number().required(),
});
