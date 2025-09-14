import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import configuration from './configuration';
import { configValidationSchema } from './config.validation';

@Module({
  exports: [NestConfigModule],
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      isGlobal: true,
      load: [configuration],
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
      validationSchema: configValidationSchema,
    }),
  ],
})
export class ConfigModule {}
