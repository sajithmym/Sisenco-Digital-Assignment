import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsEnum,
  MaxLength,
  IsBoolean,
  IsUUID,
  ArrayMaxSize,
  ValidateIf,
  MinLength,
  Matches,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { REPORT_SETTINGS } from "../../settings";

class CreateTaskDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @MinLength(1)
  @MaxLength(500)
  taskName: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
  priority?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(100)
  plannedPercentage?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(100)
  actualPercentage?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"])
  status?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(10080)
  plannedMinutes?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(10080)
  actualMinutes?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(500)
  deliverable?: string;
}

class CreateNextWeekTaskDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class CreateBlockerDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isKeyIssue?: boolean;

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isResolved?: boolean;
}

class CreateAchievementDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isKeyAchievement?: boolean;
}

class CreateWorkHourDto {
  @IsEnum(["DEVELOPMENT", "TESTING", "MEETINGS", "DOCUMENTATION", "OTHER"])
  type: string;

  @IsInt()
  @Min(0)
  @Max(10080)
  minutes: number;
}

export class CreateReportDto {
  @IsOptional()
  @IsUUID()
  projectId?: string | null;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  weekStart: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  weekEnd: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(REPORT_SETTINGS.maxItemsPerSection)
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks?: CreateTaskDto[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(REPORT_SETTINGS.maxItemsPerSection)
  @ValidateNested({ each: true })
  @Type(() => CreateNextWeekTaskDto)
  nextWeekTasks?: CreateNextWeekTaskDto[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(REPORT_SETTINGS.maxItemsPerSection)
  @ValidateNested({ each: true })
  @Type(() => CreateBlockerDto)
  blockers?: CreateBlockerDto[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(REPORT_SETTINGS.maxItemsPerSection)
  @ValidateNested({ each: true })
  @Type(() => CreateAchievementDto)
  achievements?: CreateAchievementDto[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(REPORT_SETTINGS.maxItemsPerSection)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkHourDto)
  workHours?: CreateWorkHourDto[];
}
