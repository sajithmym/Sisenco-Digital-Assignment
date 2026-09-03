import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto';

export class ReportFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsDateString()
  weekEnd?: string;
}
