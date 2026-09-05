import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  Max,
  Min,
  IsUUID,
  IsIn,
} from "class-validator";
import { PaginationDto } from "../../common/dto";
import { DASHBOARD_SETTINGS } from "../../settings";

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
  @IsDateString()
  weekEnd?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(52)
  weeks: number = DASHBOARD_SETTINGS.defaultTaskTrendWeeks;
}

export class ActivityFilterDto extends DashboardDateFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = DASHBOARD_SETTINGS.defaultActivityLimit;
}

export class RosterFilterDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsDateString()
  weekEnd?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsIn([
    "DRAFT",
    "SUBMITTED",
    "NEEDS_CORRECTION",
    "APPROVED",
    "NOT_STARTED",
    "LATE",
    "PENDING",
  ])
  status?: string;
}
