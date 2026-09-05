import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { UserRole } from '../../common/enums';
import { VALIDATION_SETTINGS } from '../../settings';

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_SETTINGS.search.max)
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  isActive?: boolean;
}
