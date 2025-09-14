import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    const isProduction = configService.get<boolean>('app.isProduction');
    super({
      log: isProduction ? ['error'] : ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🔗 Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  enableShutdownHooks(app: { close: () => Promise<void> }) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
