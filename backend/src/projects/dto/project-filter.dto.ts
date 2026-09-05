import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { VALIDATION_SETTINGS } from '../../settings';

export class ProjectFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_SETTINGS.search.max)
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  isActive?: boolean;
}
