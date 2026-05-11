/**
 * Location API: wards, districts, ward by id
 * Backend may return camelCase; normalize to PascalCase for WardDto.
 */
import { apiGet } from './apiClient';
import type { WardDto, WardDetailDto } from '../types/api';

function rawToWardDto(raw: Record<string, unknown>): WardDto {
  return {
    WardId: String((raw.wardId ?? raw.WardId) ?? ''),
    WardName: String((raw.wardName ?? raw.WardName) ?? ''),
    DistrictName: (raw.districtName ?? raw.DistrictName) as string | null ?? null,
  };
}

export async function getWards(): Promise<WardDto[]> {
  const data = await apiGet<unknown>('api/Location/wards', { retries: 2 });
  if (!Array.isArray(data)) return [];
  return data.map((item) => rawToWardDto((item as Record<string, unknown>) ?? {}));
}

export async function getDistricts(): Promise<string[]> {
  const data = await apiGet<string[]>('api/Location/districts', { retries: 2 });
  return Array.isArray(data) ? data : [];
}

export async function getWardsByDistrict(districtName: string): Promise<WardDto[]> {
  const encoded = encodeURIComponent(districtName);
  const data = await apiGet<unknown>(`api/Location/wards/by-district/${encoded}`, { retries: 2 });
  if (!Array.isArray(data)) return [];
  return data.map((item) => rawToWardDto((item as Record<string, unknown>) ?? {}));
}

/** GET /api/Location/wards/{id} – ward detail by WardId */
export async function getWardById(id: string): Promise<WardDetailDto> {
  return apiGet<WardDetailDto>(`api/Location/wards/${encodeURIComponent(id)}`);
}

/** Build a map WardId -> { wardName, districtName } for camera mapping */
export function buildWardMap(wards: WardDto[]): Map<string, { wardName: string; districtName: string }> {
  const map = new Map<string, { wardName: string; districtName: string }>();
  for (const w of wards) {
    map.set(w.WardId, {
      wardName: w.WardName,
      districtName: w.DistrictName ?? '',
    });
  }
  return map;
}
