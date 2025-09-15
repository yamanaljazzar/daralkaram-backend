import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Core Modules
import { CoreModule } from './core';
import { ConfigModule } from './config';
import { CommonModule } from './common';
import { DatabaseModule } from './database';
import { AppController } from './app.controller';
import { DemoModule } from './modules/demo/demo.module';
// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { LoggingInterceptor } from './core/interceptors';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { ClassTemplatesModule } from './modules/class-templates/class-templates.module';

@Module({
  controllers: [AppController],
  imports: [
    // Core Modules
    ConfigModule,
    CoreModule,
    CommonModule,
    DatabaseModule,

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            limit: configService.get<number>('rateLimit.limit') ?? 200,
            name: 'global',
            ttl: (configService.get<number>('rateLimit.ttl') ?? 60) * 1000,
          },
        ],
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    AcademicYearsModule,
    ClassTemplatesModule,
    ClassesModule,
    DemoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
