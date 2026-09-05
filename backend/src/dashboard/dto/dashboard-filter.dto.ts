import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DASHBOARD_SETTINGS } from '../../settings';

export class DashboardDateFilterDto {
  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsDateString()
  weekEnd?: string;
}

export class TaskTrendFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(52)
  weeks: number = DASHBOARD_SETTINGS.defaultTaskTrendWeeks;
}

export class ActivityFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = DASHBOARD_SETTINGS.defaultActivityLimit;
}
