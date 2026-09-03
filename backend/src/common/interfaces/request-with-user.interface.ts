import { Request } from 'express';
import { UserRole } from '../enums';

/**
 * Shape of the authenticated user attached to the request by JwtStrategy.
 */
export interface AuthenticatedUser {
  /** User id (JWT `sub` claim) */
  sub: string;
  email: string;
  role: UserRole;
}

/**
 * Typed Express request carrying the authenticated user.
 * Use as `@Req() req: RequestWithUser` in controllers that need the full user,
 * or pair with the `@CurrentUser()` decorator for a single field.
 */
export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}