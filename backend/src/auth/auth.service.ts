import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type ms from 'ms';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AUTH_SETTINGS, USER_SETTINGS } from '../settings';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(AUTH_SETTINGS.messages.emailAlreadyRegistered);
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      AUTH_SETTINGS.passwordHashRounds,
    );

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: USER_SETTINGS.defaultRole,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error) {
      // Race condition: two requests with the same email — surface the real cause.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(AUTH_SETTINGS.messages.emailAlreadyRegistered);
      }
      throw error;
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_SETTINGS.messages.invalidCredentials);
    }

    if (!user.isActive) {
      throw new ForbiddenException(AUTH_SETTINGS.messages.accountDeactivated);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_SETTINGS.messages.invalidCredentials);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: AUTH_SETTINGS.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException(AUTH_SETTINGS.messages.invalidRefreshToken);
    }

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashRefreshToken(refreshToken) },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException(AUTH_SETTINGS.messages.invalidRefreshToken);
    }

    if (tokenRecord.userId !== payload.sub) {
      throw new UnauthorizedException(AUTH_SETTINGS.messages.invalidRefreshToken);
    }

    if (new Date() > tokenRecord.expiresAt) {
      await this.prisma.refreshToken.deleteMany({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException(AUTH_SETTINGS.messages.expiredRefreshToken);
    }

    const user = tokenRecord.user;
    if (!user.isActive) {
      await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      throw new ForbiddenException(AUTH_SETTINGS.messages.accountDeactivated);
    }

    return this.prisma.$transaction(async (transaction) => {
      // Atomic compare-and-delete prevents a concurrent refresh from replaying the same token.
      const consumedToken = await transaction.refreshToken.deleteMany({
        where: { id: tokenRecord.id, tokenHash: this.hashRefreshToken(refreshToken) },
      });

      if (consumedToken.count !== 1) {
        throw new UnauthorizedException(AUTH_SETTINGS.messages.usedRefreshToken);
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await transaction.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: this.hashRefreshToken(tokens.refreshToken),
          expiresAt: this.getRefreshTokenExpiry(),
        },
      });

      return tokens;
    });
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash: this.hashRefreshToken(refreshToken) },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(USER_SETTINGS.messages.notFound);
    }

    return user;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: AUTH_SETTINGS.jwtAccessExpiresIn as ms.StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: AUTH_SETTINGS.jwtRefreshSecret,
        expiresIn: AUTH_SETTINGS.jwtRefreshExpiresIn as ms.StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    // Expired rows are never useful and should not accumulate indefinitely.
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashRefreshToken(token),
        expiresAt: this.getRefreshTokenExpiry(),
      },
    });
  }

  private getRefreshTokenExpiry() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_SETTINGS.jwtRefreshExpiresInDays);
    return expiresAt;
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
