import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION_SETTINGS } from '../../settings';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION_SETTINGS.defaultPage)
  page: number = PAGINATION_SETTINGS.defaultPage;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION_SETTINGS.defaultPage)
  @Max(PAGINATION_SETTINGS.maxLimit)
  limit: number = PAGINATION_SETTINGS.defaultLimit;
}

export class PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
