import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VALIDATION_SETTINGS } from '../../settings';

export class RequestChangesDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_SETTINGS.reportNotes.max)
  comment: string;
}
