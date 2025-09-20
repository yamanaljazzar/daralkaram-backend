import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { applyDecorators } from '@nestjs/common';

interface BooleanQueryOptions {
  defaultValue?: boolean;
  message?: string;
}

/**
 * Decorator for handling boolean query parameters with automatic transformation and validation.
 *
 * @param options Configuration options for the boolean parameter
 * @param options.defaultValue - Default value when parameter is missing (default: false)
 * @param options.message - Custom validation error message
 *
 * @example
 * ```typescript
 * export class MyQueryDto {
 *   @BooleanQuery({ defaultValue: false, message: 'Active must be a boolean value' })
 *   active?: boolean;
 *
 *   @BooleanQuery({ defaultValue: true })
 *   includeArchived?: boolean;
 * }
 * ```
 */
export function BooleanQuery(options: BooleanQueryOptions = {}) {
  const { defaultValue = false, message } = options;

  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => {
      if (typeof value === 'string') {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return defaultValue;
      }

      if (typeof value === 'boolean') {
        return value;
      }

      if (value === null || value === undefined) {
        return defaultValue;
      }

      return defaultValue;
    }),
    IsBoolean({
      message: message || `Value must be a boolean`,
    }),
  );
}
