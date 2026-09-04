import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ApiResponse } from '../common/dto';
import { API_RESPONSE_MESSAGES } from '../settings';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const data = await this.authService.register(dto);
      return ApiResponse.created(data, API_RESPONSE_MESSAGES.auth.registered);
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    try {
      const data = await this.authService.login(dto.email, dto.password);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.auth.loggedIn);
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    try {
      const data = await this.authService.refreshTokens(refreshToken);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.auth.refreshed);
    } catch (error) {
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    try {
      await this.authService.logout(refreshToken);
      return ApiResponse.success(null, API_RESPONSE_MESSAGES.auth.loggedOut);
    } catch (error) {
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('sub') userId: string) {
    try {
      const data = await this.authService.getMe(userId);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.auth.userFetched);
    } catch (error) {
      throw error;
    }
  }
}
