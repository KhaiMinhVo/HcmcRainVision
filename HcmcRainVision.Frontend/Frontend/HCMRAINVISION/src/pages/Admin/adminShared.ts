/**
 * Shared constants and helpers for Admin pages.
 */

export const ADMIN_LOADING_TEXT = 'Đang tải...';

export function getApiErrorMessage(e: unknown, fallback: string): string {
  return e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : fallback;
}
