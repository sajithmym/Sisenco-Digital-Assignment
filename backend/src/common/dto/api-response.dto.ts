import { HttpStatus } from '@nestjs/common';

/**
 * Metadata accompanying paginated list responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Unified response envelope. Every endpoint returns (or the global
 * exception filter builds) an instance of this shape so the UI always
 * receives: `{ success, statusCode, message, data, timestamp, code? }`.
 */
export class ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  /** Machine-readable error code — present only on error responses. */
  code?: string;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T,
    code?: string,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Request successful'): ApiResponse<T> {
    return new ApiResponse<T>(true, HttpStatus.OK, message, data);
  }

  static created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
    return new ApiResponse<T>(true, HttpStatus.CREATED, message, data);
  }

  static paginated<T>(
    data: T[],
    meta: PaginationMeta,
    message = 'Resources fetched successfully',
  ): ApiPaginatedResponse<T> {
    return new ApiPaginatedResponse<T>(true, HttpStatus.OK, message, data, meta);
  }

  static error<T = null>(
    statusCode: number,
    message: string,
    code = 'ERROR',
  ): ApiResponse<T> {
    return new ApiResponse<T>(false, statusCode, message, null as unknown as T, code);
  }
}

/**
 * Envelope for paginated list endpoints: `data` holds the items and
 * `meta` holds pagination information.
 */
export class ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T[],
    meta: PaginationMeta,
    code?: string,
  ) {
    super(success, statusCode, message, data, code);
    this.meta = meta;
  }
}