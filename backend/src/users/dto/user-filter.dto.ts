import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { UserRole } from '../../common/enums';

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
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
