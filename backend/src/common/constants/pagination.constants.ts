import { PAGINATION_SETTINGS } from '../../settings';

/**
 * @deprecated Use PAGINATION_SETTINGS from '../../settings' directly.
 * Kept for backward compatibility.
 */
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: PAGINATION_SETTINGS.defaultPage,
  DEFAULT_LIMIT: PAGINATION_SETTINGS.defaultLimit,
  MAX_LIMIT: PAGINATION_SETTINGS.maxLimit,
} as const;
