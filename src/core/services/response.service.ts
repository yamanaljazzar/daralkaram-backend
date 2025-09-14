import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';

/**
 * Standard API response interface for consistent response formatting
 * @template T - The type of data being returned
 */
export interface ApiResponse<T = unknown> {
  /** Indicates whether the request was successful */
  success: boolean;
  /** Human-readable message describing the result */
  message: string;
  /** The actual data payload (optional for error responses) */
  data?: T;
  /** Error details (only present for error responses) */
  error?: string;
  /** ISO timestamp of when the response was generated */
  timestamp: string;
  /** HTTP status code */
  statusCode: number;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Paginated data structure
 * @template T - The type of items in the array
 */
export interface PaginatedData<T> {
  /** Array of items for the current page */
  items: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Service for creating standardized API responses
 * Provides methods for success, error, and paginated responses
 */
@Injectable()
export class ResponseService {
  /**
   * Creates a successful API response
   * @template T - The type of data being returned
   * @param data - The data to return
   * @param message - Success message (default: 'Success')
   * @param statusCode - HTTP status code (default: 200)
   * @returns Formatted success response
   */
  success<T>(data: T, message = 'Success', statusCode = HttpStatus.OK): ApiResponse<T> {
    this.validateStatusCode(statusCode, 'success');

    return {
      data,
      message,
      statusCode,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates an error API response
   * @param message - Error message (default: 'Error')
   * @param statusCode - HTTP status code (default: 400)
   * @param error - Additional error details (optional)
   * @returns Formatted error response
   */
  error(
    message = 'Error',
    statusCode = HttpStatus.BAD_REQUEST,
    error?: string,
  ): ApiResponse<never> {
    this.validateStatusCode(statusCode, 'error');

    return {
      error,
      message,
      statusCode,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a paginated API response
   * @template T - The type of items in the array
   * @param data - Array of items for the current page
   * @param total - Total number of items across all pages
   * @param page - Current page number (1-based)
   * @param limit - Number of items per page
   * @param message - Success message (default: 'Success')
   * @returns Formatted paginated response
   * @throws BadRequestException if pagination parameters are invalid
   */
  paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success',
  ): ApiResponse<PaginatedData<T>> {
    this.validatePaginationParams(total, page, limit);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: {
        items: data,
        pagination: {
          hasNext,
          hasPrev,
          limit,
          page,
          total,
          totalPages,
        },
      },
      message,
      statusCode: HttpStatus.OK,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a "created" response (201 status code)
   * @template T - The type of data being returned
   * @param data - The created resource data
   * @param message - Success message (default: 'Resource created successfully')
   * @returns Formatted created response
   */
  created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
    return this.success(data, message, HttpStatus.CREATED);
  }

  /**
   * Creates a "no content" response (204 status code)
   * @param message - Success message (default: 'Operation completed successfully')
   * @returns Formatted no content response
   */
  noContent(message = 'Operation completed successfully'): ApiResponse<null> {
    return this.success(null, message, HttpStatus.NO_CONTENT);
  }

  /**
   * Creates a "not found" error response (404 status code)
   * @param message - Error message (default: 'Resource not found')
   * @param resource - Name of the resource that was not found (optional)
   * @returns Formatted not found response
   */
  notFound(message = 'Resource not found', resource?: string): ApiResponse<never> {
    const errorMessage = resource ? `${resource} not found` : message;
    return this.error(errorMessage, HttpStatus.NOT_FOUND);
  }

  /**
   * Creates an "unauthorized" error response (401 status code)
   * @param message - Error message (default: 'Unauthorized access')
   * @returns Formatted unauthorized response
   */
  unauthorized(message = 'Unauthorized access'): ApiResponse<never> {
    return this.error(message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Creates a "forbidden" error response (403 status code)
   * @param message - Error message (default: 'Access forbidden')
   * @returns Formatted forbidden response
   */
  forbidden(message = 'Access forbidden'): ApiResponse<never> {
    return this.error(message, HttpStatus.FORBIDDEN);
  }

  /**
   * Creates a "bad request" error response (400 status code)
   * @param message - Error message (default: 'Bad request')
   * @param error - Additional error details (optional)
   * @returns Formatted bad request response
   */
  badRequest(message = 'Bad request', error?: string): ApiResponse<never> {
    return this.error(message, HttpStatus.BAD_REQUEST, error);
  }

  /**
   * Creates an "internal server error" response (500 status code)
   * @param message - Error message (default: 'Internal server error')
   * @param error - Additional error details (optional)
   * @returns Formatted internal server error response
   */
  internalError(message = 'Internal server error', error?: string): ApiResponse<never> {
    return this.error(message, HttpStatus.INTERNAL_SERVER_ERROR, error);
  }

  /**
   * Validates HTTP status codes
   * @private
   * @param statusCode - The status code to validate
   * @param type - The type of response ('success' or 'error')
   * @throws BadRequestException if status code is invalid
   */
  private validateStatusCode(statusCode: HttpStatus, type: 'success' | 'error'): void {
    const statusCodeNumber = typeof statusCode === 'number' ? statusCode : Number(statusCode);
    if (
      !Number.isInteger(statusCodeNumber) ||
      statusCodeNumber < Number(HttpStatus.CONTINUE) ||
      statusCodeNumber >= 600
    ) {
      throw new BadRequestException('Invalid status code');
    }

    if (type === 'success' && statusCode >= HttpStatus.BAD_REQUEST) {
      throw new BadRequestException('Success responses should have status codes < 400');
    }

    if (type === 'error' && statusCode < HttpStatus.BAD_REQUEST) {
      throw new BadRequestException('Error responses should have status codes >= 400');
    }
  }

  /**
   * Validates pagination parameters
   * @private
   * @param total - Total number of items
   * @param page - Current page number
   * @param limit - Items per page
   * @throws BadRequestException if parameters are invalid
   */
  private validatePaginationParams(total: number, page: number, limit: number): void {
    if (!Number.isInteger(total) || total < 0) {
      throw new BadRequestException('Total must be a non-negative integer');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    if (limit > 1000) {
      throw new BadRequestException('Limit cannot exceed 1000 items per page');
    }
  }
}
