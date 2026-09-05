import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { VALIDATION_SETTINGS } from '../../settings';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(VALIDATION_SETTINGS.projectName.min)
  @MaxLength(VALIDATION_SETTINGS.projectName.max)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_SETTINGS.projectDescription.max)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
