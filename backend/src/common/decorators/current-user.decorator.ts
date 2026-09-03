import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedUser,
  RequestWithUser,
} from '../interfaces/request-with-user.interface';

/**
 * Extracts the authenticated user (or a single field of it) from the request.
 *
 * Usage:
 *   @CurrentUser() user: AuthenticatedUser
 *   @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);