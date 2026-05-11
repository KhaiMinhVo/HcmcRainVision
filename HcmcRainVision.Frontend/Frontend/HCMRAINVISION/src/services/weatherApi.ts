/**
 * Weather API: latest, heatmap, check-route, report
 */
import { apiGet, apiPost, apiPostFormData } from './apiClient';
import type {
  WeatherLatestItemDto,
  HeatmapPointDto,
  ReportDto,
  RoutePointDto,
  RainingCameraDto,
} from '../types/api';
import type { RainDataPoint, RainLevel } from '../types';

function rawToWeatherLatestItem(raw: Record<string, unknown>): WeatherLatestItemDto {
  return {
    Id: Number(raw.id ?? raw.Id ?? 0),
    CameraId: String((raw.cameraId ?? raw.CameraId) ?? ''),
    Latitude: Number(raw.latitude ?? raw.Latitude ?? 0),
    Longitude: Number(raw.longitude ?? raw.Longitude ?? 0),
    IsRaining: Boolean(raw.isRaining ?? raw.IsRaining),
    Confidence: Number(raw.confidence ?? raw.Confidence ?? 0),
    TimeAgo: String((raw.timeAgo ?? raw.TimeAgo) ?? ''),
    Timestamp: String((raw.timestamp ?? raw.Timestamp) ?? ''),
  };
}

function rawToHeatmapPoint(raw: Record<string, unknown>): HeatmapPointDto {
  return {
    Lat: Number(raw.lat ?? raw.Lat ?? 0),
    Lng: Number(raw.lng ?? raw.Lng ?? 0),
    Intensity: Number(raw.intensity ?? raw.Intensity ?? 0),
  };
}

export async function getLatestWeather(): Promise<WeatherLatestItemDto[]> {
  const data = await apiGet<unknown>('api/Weather/latest', { retries: 2 });
  if (!Array.isArray(data)) return [];
  return data.map((item) => rawToWeatherLatestItem((item as Record<string, unknown>) ?? {}));
}

export async function getRainHeatmap(): Promise<HeatmapPointDto[]> {
  const data = await apiGet<unknown>('api/Weather/heatmap', { retries: 2 });
  if (!Array.isArray(data)) return [];
  return data.map((item) => rawToHeatmapPoint((item as Record<string, unknown>) ?? {}));
}

export async function getRainingCameras(minutes = 30): Promise<RainingCameraDto[]> {
  const endpoint = `api/Weather/raining-cameras?minutes=${minutes}`;
  console.debug(`[weatherApi.getRainingCameras] Fetching endpoint: ${endpoint}`);
  
  const response = await apiGet<unknown>(endpoint, { retries: 2 });
  console.debug('[weatherApi.getRainingCameras] raw response:', response);
  
  // Handle both wrapped response {Count, Data[]} and direct array response
  let dataArray: unknown[] = [];
  if (Array.isArray(response)) {
    dataArray = response;
  } else if (response && typeof response === 'object' && 'Data' in response && Array.isArray((response as any).Data)) {
    dataArray = (response as any).Data;
  } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
    dataArray = (response as any).data;
  }
  
  console.debug('[weatherApi.getRainingCameras] dataArray:', dataArray.length, dataArray);
  
  const mapped: RainingCameraDto[] = dataArray.map((item) => {
    const raw = item as Record<string, unknown>;
    const dto: RainingCameraDto = {
      CameraId: String(raw.cameraId ?? raw.CameraId ?? ''),
      CameraName: String(raw.cameraName ?? raw.CameraName ?? ''),
      Latitude: Number(raw.latitude ?? raw.Latitude ?? 0),
      Longitude: Number(raw.longitude ?? raw.Longitude ?? 0),
      WardId: (raw.wardId ?? raw.WardId) as string | null | undefined,
      CameraStatus: (raw.cameraStatus ?? raw.CameraStatus) as string | null | undefined,
      Confidence: Number(raw.confidence ?? raw.Confidence ?? 0),
      LastRainAtUtc: String(raw.lastRainAtUtc ?? raw.LastRainAtUtc ?? ''),
      ImageUrl: (raw.imageUrl ?? raw.ImageUrl) as string | null | undefined,
    };
    console.debug(`[weatherApi.getRainingCameras] Mapped camera: ${dto.CameraId} (${dto.CameraName})`, dto);
    return dto;
  });
  
  console.debug('[weatherApi.getRainingCameras] Total mapped cameras:', mapped.length);
  return mapped;
}

export function mapRainingCameraToRainPoint(item: RainingCameraDto): RainDataPoint {
  const rainLevel: RainLevel = item.Confidence >= 0.7 ? 2 : 1;
  return {
    id: item.CameraId,
    lat: item.Latitude,
    lng: item.Longitude,
    rainLevel,
    timestamp: item.LastRainAtUtc,
  };
}

export async function checkRoute(routePoints: RoutePointDto[]): Promise<{
  IsSafe: boolean;
  Warnings: Array<{ Lat: number; Lng: number; Message: string }>;
}> {
  return apiPost('api/Weather/check-route', routePoints);
}

export async function reportIncorrectPrediction(body: ReportDto): Promise<{ message: string }> {
  return apiPost('api/Weather/report', body);
}

/** POST api/Weather/test-ai � upload image for AI prediction test (multipart). */
export async function testAi(imageFile: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('ImageFile', imageFile);
  return apiPostFormData<unknown>('api/Weather/test-ai', formData);
}

/** Map latest item to RainDataPoint (rainLevel from IsRaining + Confidence) */
export function mapLatestToRainPoint(item: WeatherLatestItemDto): RainDataPoint {
  let rainLevel: RainLevel = 0;
  if (item.IsRaining) {
    rainLevel = item.Confidence >= 0.7 ? 2 : 1;
  }
  return {
    id: item.CameraId, // Use CameraId to match with camera list
    lat: item.Latitude,
    lng: item.Longitude,
    rainLevel,
    timestamp: item.Timestamp || item.TimeAgo,
  };
}
