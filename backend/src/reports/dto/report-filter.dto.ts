import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { ReportStatus } from '../../common/enums';

export class ReportFilterDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsDateString()
  weekEnd?: string;
}
