import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto';

export class ReportFilterDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
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
