import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

import { Injectable, CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';

import { LoggerService } from '@/core/services';

interface HttpError {
  status?: number;
  message?: string;
  stack?: string;
  constructor?: {
    name?: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { headers, ip, method, url } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    this.logger.log(`Incoming ${method} ${url}`, 'HTTP', {
      ip,
      method,
      timestamp: new Date().toISOString(),
      url,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        error: (error: HttpError) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `HTTP Error: ${method} ${url} - ${error.message || 'Unknown error'}`,
            error.stack,
            'HTTP',
            {
              duration,
              errorType: error.constructor?.name || 'Unknown',
              ip,
              method,
              statusCode,
              url,
              userAgent,
            },
          );
        },
        next: data => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.logRequest(method, url, statusCode, duration, 'HTTP', {
            ip,
            responseSize: JSON.stringify(data).length,
            userAgent,
          });
        },
      }),
    );
  }
}
