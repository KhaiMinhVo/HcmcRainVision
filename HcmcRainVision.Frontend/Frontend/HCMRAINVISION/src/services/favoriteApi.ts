/**
 * Favorites API: GET/POST/DELETE /api/Favorite (requires auth)
 * Backend may return camelCase; normalize via rawToCameraDto.
 */
import { apiGet, apiPost, apiDelete } from './apiClient';
import type { CameraInfo } from '../types';
import { mapCameraToInfo, rawToCameraDto } from './cameraApi';
import { getWards, buildWardMap } from './locationApi';

export async function getFavorites(): Promise<CameraInfo[]> {
  const data = await apiGet<unknown>('api/Favorite');
  if (!Array.isArray(data)) return [];
  const wards = await getWards();
  const wardMap = buildWardMap(wards);
  return data.map((item) => mapCameraToInfo(rawToCameraDto((item as Record<string, unknown>) ?? {}), wardMap));
}

export async function addFavorite(cameraId: string): Promise<void> {
  await apiPost(`api/Favorite/${encodeURIComponent(cameraId)}`, {});
}

export async function removeFavorite(cameraId: string): Promise<void> {
  await apiDelete(`api/Favorite/${encodeURIComponent(cameraId)}`);
}
