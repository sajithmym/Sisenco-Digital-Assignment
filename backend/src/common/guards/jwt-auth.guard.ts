import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../interfaces';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: TUser | undefined,
    info: { message?: string } | undefined,
  ): TUser {
    if (err) {
      throw err;
    }

    if (!user) {
      // `info` carries the passport-jwt failure reason — surface the actual cause.
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException('Session expired. Please log in again.');
      }

      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('Authentication token is missing.');
      }

      throw new UnauthorizedException(info?.message || 'Unauthorized.');
    }

    return user;
  }
}
