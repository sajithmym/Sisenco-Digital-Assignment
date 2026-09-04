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
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateTaskDto {
  @IsUUID()
  @MaxLength(500)
  taskName: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  plannedPercentage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  actualPercentage?: number;

  @IsOptional()
  @IsEnum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  plannedMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  actualMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliverable?: string;
}

class CreateNextWeekTaskDto {
  @IsString()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class CreateBlockerDto {
  @IsString()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsBoolean()
  isKeyIssue?: boolean;

  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;
}

class CreateAchievementDto {
  @IsString()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsBoolean()
  isKeyAchievement?: boolean;
}

class CreateWorkHourDto {
  @IsEnum(['DEVELOPMENT', 'TESTING', 'MEETINGS', 'DOCUMENTATION', 'OTHER'])
  type: string;

  @IsInt()
  @Min(0)
  minutes: number;
}

export class CreateReportDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsDateString()
  weekStart: string;

  @IsDateString()
  weekEnd: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks?: CreateTaskDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNextWeekTaskDto)
  nextWeekTasks?: CreateNextWeekTaskDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockerDto)
  blockers?: CreateBlockerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAchievementDto)
  achievements?: CreateAchievementDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkHourDto)
  workHours?: CreateWorkHourDto[];
}
