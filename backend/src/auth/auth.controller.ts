import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ApiResponse } from '../common/dto';
import { API_RESPONSE_MESSAGES, AUTH_SETTINGS } from '../settings';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: AUTH_SETTINGS.authRateLimit.registrationAttempts, ttl: AUTH_SETTINGS.authRateLimit.ttlMilliseconds } })
  async register(@Body() dto: RegisterDto) {
    try {
      if (!AUTH_SETTINGS.allowSelfRegistration) {
        throw new ForbiddenException(AUTH_SETTINGS.messages.selfRegistrationDisabled);
      }
      const data = await this.authService.register(dto);
      return ApiResponse.created(data, API_RESPONSE_MESSAGES.auth.registered);
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AUTH_SETTINGS.authRateLimit.loginAttempts, ttl: AUTH_SETTINGS.authRateLimit.ttlMilliseconds } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    try {
      const data = await this.authService.login(dto.email, dto.password);
      return ApiResponse.success(this.setRefreshCookie(response, data), API_RESPONSE_MESSAGES.auth.loggedIn);
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AUTH_SETTINGS.authRateLimit.refreshAttempts, ttl: AUTH_SETTINGS.authRateLimit.ttlMilliseconds } })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    try {
      this.assertSameSiteRequest(request);
      const refreshToken = request.cookies?.[AUTH_SETTINGS.refreshCookieName];
      if (!refreshToken) {
        throw new ForbiddenException(AUTH_SETTINGS.messages.refreshTokenMissing);
      }
      const data = await this.authService.refreshTokens(refreshToken);
      return ApiResponse.success(this.setRefreshCookie(response, data), API_RESPONSE_MESSAGES.auth.refreshed);
    } catch (error) {
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    try {
      this.assertSameSiteRequest(request);
      const refreshToken = request.cookies?.[AUTH_SETTINGS.refreshCookieName];
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      response.clearCookie(AUTH_SETTINGS.refreshCookieName, AUTH_SETTINGS.refreshCookie);
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

  private setRefreshCookie(
    response: Response,
    data: { refreshToken: string; accessToken: string; user?: unknown },
  ) {
    const { refreshToken, ...responseData } = data;
    response.cookie(
      AUTH_SETTINGS.refreshCookieName,
      refreshToken,
      AUTH_SETTINGS.refreshCookie,
    );
    return responseData;
  }

  private assertSameSiteRequest(request: Request) {
    if (request.get(AUTH_SETTINGS.csrfHeaderName) !== AUTH_SETTINGS.csrfHeaderValue) {
      throw new ForbiddenException(AUTH_SETTINGS.messages.invalidBrowserRequest);
    }
  }
}
