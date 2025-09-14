import { Module, Global } from '@nestjs/common';

import { LoggerService } from './services/logger.service';
import { ResponseService } from './services/response.service';
import { LoggingInterceptor, ResponseInterceptor } from './interceptors';

@Global()
@Module({
  exports: [ResponseService, ResponseInterceptor, LoggerService, LoggingInterceptor],
  providers: [ResponseService, ResponseInterceptor, LoggerService, LoggingInterceptor],
})
export class CoreModule {}
