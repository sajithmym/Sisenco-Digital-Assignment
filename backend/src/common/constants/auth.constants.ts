import { AUTH_SETTINGS } from '../../settings';

/**
 * @deprecated Use AUTH_SETTINGS from '../../settings' directly.
 * Kept for backward compatibility.
 */
export const AUTH_CONSTANTS = {
  PASSWORD_HASH_ROUNDS: AUTH_SETTINGS.passwordHashRounds,
  ACCESS_TOKEN_EXPIRY: AUTH_SETTINGS.jwtAccessExpiresIn,
  REFRESH_TOKEN_EXPIRY: AUTH_SETTINGS.jwtRefreshExpiresIn,
  REFRESH_TOKEN_EXPIRY_DAYS: AUTH_SETTINGS.jwtRefreshExpiresInDays,
} as const;
