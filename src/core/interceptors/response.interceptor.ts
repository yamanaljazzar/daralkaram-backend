import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable, CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';

import { ApiResponse, ResponseService } from '@/core/services';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly responseService: ResponseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data as unknown as ApiResponse<T>;
        }

        return this.responseService.success(data);
      }),
    );
  }
}
