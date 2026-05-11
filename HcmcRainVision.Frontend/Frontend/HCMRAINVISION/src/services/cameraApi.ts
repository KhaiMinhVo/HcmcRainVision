/**
 * Camera API: GET /api/camera
 * Backend may return camelCase; normalize to PascalCase for CameraDto.
 */
import { apiGet } from './apiClient';
import type { CameraDto } from '../types/api';
import type { CameraInfo } from '../types';

export function rawToCameraDto(raw: Record<string, unknown>): CameraDto {
  return {
    Id: String((raw.id ?? raw.Id) ?? ''),
    Name: String((raw.name ?? raw.Name) ?? ''),
    Latitude: Number(raw.latitude ?? raw.Latitude ?? 0),
    Longitude: Number(raw.longitude ?? raw.Longitude ?? 0),
    WardId: (raw.wardId ?? raw.WardId) as string | null | undefined,
    Status: (raw.status ?? raw.Status) as string | null | undefined,
    StreamUrl: (raw.streamUrl ?? raw.StreamUrl) as string | null | undefined,
  };
}

/** Backend returns { Total, Page, PageSize, Data } (PascalCase or camelCase). Default pageSize=10; request more to get full list. */
export async function getCameras(): Promise<CameraDto[]> {
  const pageSize = 500;
  const data = await apiGet<unknown>(`api/Camera?page=1&pageSize=${pageSize}`, { retries: 2 });
  const list = Array.isArray(data)
    ? data
    : (data && typeof data === 'object' && 'Data' in data && Array.isArray((data as { Data: unknown }).Data))
      ? (data as { Data: unknown[] }).Data
      : (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data))
        ? (data as { data: unknown[] }).data
        : [];
  return list.map((item) => rawToCameraDto((item as Record<string, unknown>) ?? {}));
}

/** GET /api/Camera/{id} – chi tiết một camera (StreamUrl, v.v.). Returns null if 404. */
export async function getCameraById(id: string): Promise<CameraDto | null> {
  try {
    const raw = await apiGet<Record<string, unknown>>(
      `api/Camera/${encodeURIComponent(id)}`,
      { retries: 1 }
    );
    return rawToCameraDto(raw ?? {});
  } catch (e) {
    const err = e as { status?: number };
    if (err?.status === 404) return null;
    throw e;
  }
}

/** Map backend camera to app CameraInfo (ward/district/address from wards map if provided) */
export function mapCameraToInfo(
  c: CameraDto,
  wardNames?: Map<string, { wardName: string; districtName: string }>
): CameraInfo {
  const wardId = c.WardId ?? 'DEFAULT';
  const info = wardNames?.get(wardId);
  const ward = info?.wardName ?? wardId;
  const district = info?.districtName ?? '';
  const address = [c.Name, ward, district].filter(Boolean).join(', ') + (district ? ', TP.HCM' : '');
  return {
    id: c.Id,
    name: c.Name,
    address,
    ward,
    district,
    wardId: c.WardId ?? undefined,
    lat: c.Latitude,
    lng: c.Longitude,
    streamUrl: c.StreamUrl ?? undefined,
  };
}
