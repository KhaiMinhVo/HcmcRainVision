/**
 * Fetches cameras, wards, weather latest; maps to CameraInfo and RainDataPoint[].
 */
import { useState, useCallback, useEffect } from 'react';
import * as cameraApi from '../services/cameraApi';
import * as weatherApi from '../services/weatherApi';
import * as locationApi from '../services/locationApi';
import type { CameraInfo, RainDataPoint } from '../types';

/** [lat, lng, intensity] for Leaflet heat layer */
export type HeatmapPoint = [number, number, number];

export interface UseCamerasAndWeatherResult {
  cameras: CameraInfo[];
  rainData: RainDataPoint[];
  heatmapPoints: HeatmapPoint[];
  districts: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCamerasAndWeather(): UseCamerasAndWeatherResult {
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [rainData, setRainData] = useState<RainDataPoint[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [camerasRaw, wards, rainingCameras, heatmap, districtsFromApi] = await Promise.all([
        cameraApi.getCameras(),
        locationApi.getWards(),
        weatherApi.getRainingCameras(30), // Get cameras that are raining in last 30 minutes
        weatherApi.getRainHeatmap(),
        locationApi.getDistricts().catch(() => [] as string[]),
      ]);
      const wardMap = locationApi.buildWardMap(wards);
      const cameraList = camerasRaw.map((c) => cameraApi.mapCameraToInfo(c, wardMap));
      const districtSet = new Set<string>();
      cameraList.forEach((c) => {
        if (c.district) districtSet.add(c.district);
      });
      
      // Build rain data: map raining cameras to rainPoints, other cameras = no rain
      const rainingCameraMap = new Map<string, typeof rainingCameras[0]>();
      rainingCameras.forEach((rc) => {
        rainingCameraMap.set(rc.CameraId, rc);
      });
      
      console.debug('[useCamerasAndWeather.refetch] rainingCameras:', rainingCameras.length);
      console.debug('[useCamerasAndWeather.refetch] rainingCameras IDs:', rainingCameras.map(rc => rc.CameraId));
      console.debug('[useCamerasAndWeather.refetch] cameraList:', cameraList.length);
      console.debug('[useCamerasAndWeather.refetch] cameraList IDs:', cameraList.map(c => c.id));
      console.debug('[useCamerasAndWeather.refetch] rainingCameraMap:', Array.from(rainingCameraMap.entries()));
      
      const allRainData: RainDataPoint[] = cameraList.map((camera) => {
        const rainingCamera = rainingCameraMap.get(camera.id);
        const result = rainingCamera 
          ? weatherApi.mapRainingCameraToRainPoint(rainingCamera)
          : {
              id: camera.id,
              lat: camera.lat,
              lng: camera.lng,
              rainLevel: 0 as const,
              timestamp: new Date().toISOString(),
            };
        if (rainingCamera) {
          console.debug(`[useCamerasAndWeather.refetch] MATCHED Camera ${camera.id}:`, result);
        }
        return result;
      });
      
      console.debug('[useCamerasAndWeather.refetch] allRainData with rain:', allRainData.filter(d => d.rainLevel > 0));
      setCameras(cameraList);
      setRainData(allRainData);
      setHeatmapPoints(heatmap.map((p) => [p.Lat, p.Lng, p.Intensity]));
      const fallbackDistricts = Array.from(districtSet).sort();
      setDistricts(districtsFromApi.length > 0 ? districtsFromApi.sort() : fallbackDistricts);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Không tải được dữ liệu.';
      setError(msg);
      if (typeof console !== 'undefined' && console.error) console.error('[useCamerasAndWeather]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    // Auto-refresh weather data every 30 seconds (cameras & wards less frequently)
    const weatherInterval = setInterval(async () => {
      try {
        const [rainingCameras, heatmap] = await Promise.all([
          weatherApi.getRainingCameras(30),
          weatherApi.getRainHeatmap(),
        ]);
        
        // Rebuild rain data with fresh data
        setRainData((prevCameras) => {
          const rainingCameraMap = new Map<string, typeof rainingCameras[0]>();
          rainingCameras.forEach((rc) => {
            rainingCameraMap.set(rc.CameraId, rc);
          });
          
          return prevCameras.map((rainPoint) => {
            const rainingCamera = rainingCameraMap.get(rainPoint.id);
            if (rainingCamera) {
              return weatherApi.mapRainingCameraToRainPoint(rainingCamera);
            }
            // No rain for this camera
            return {
              ...rainPoint,
              rainLevel: 0,
              timestamp: new Date().toISOString(),
            };
          });
        });
        
        setHeatmapPoints(heatmap.map((p) => [p.Lat, p.Lng, p.Intensity]));
      } catch (e) {
        if (typeof console !== 'undefined' && console.error) console.error('[useCamerasAndWeather] weather refresh failed:', e);
      }
    }, 30000); // 30 seconds
    return () => clearInterval(weatherInterval);
  }, [refetch]);

  return { cameras, rainData, heatmapPoints, districts, loading, error, refetch };
}
