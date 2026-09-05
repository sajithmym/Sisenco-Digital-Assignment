import { IsEmail, IsString, MinLength } from 'class-validator';
import { VALIDATION_SETTINGS } from '../../settings';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(VALIDATION_SETTINGS.password.min)
  password: string;
}
