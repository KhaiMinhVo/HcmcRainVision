/**
 * Mock data generation for HCMC Rain Detection System
 * @deprecated Live data now comes from API (GET /api/camera, GET /api/weather/latest).
 * Kept only for type reference or optional fallback; no component should import this for live data.
 */

import type { RainLevel, RainDataPoint, CameraInfo } from '../types';
import { HCMC_CENTER, CAMERA_CONFIG, RAIN_LEVEL_CONFIG, TIME_CONFIG } from '../constants';

// Real districts and wards in Ho Chi Minh City
const DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
  'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
  'Quận 11', 'Quận 12', 'Bình Thạnh', 'Tân Bình', 'Tân Phú',
  'Phú Nhuận', 'Gò Vấp', 'Bình Tân',
] as const;

const WARDS = [
  'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
  'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
  'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15',
] as const;

const STREET_NAMES = [
  'Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Pasteur', 'Nguyễn Du',
  'Lý Tự Trọng', 'Hai Bà Trưng', 'Điện Biên Phủ', 'Võ Văn Tần',
  'Nguyễn Thị Minh Khai', 'Cách Mạng Tháng 8', 'Lê Văn Việt',
  'Hoàng Diệu', 'Trần Hưng Đạo', 'Nguyễn Trãi',
] as const;

// Map bounds for HCMC
const LAT_RANGE = 0.15; // ~15km north-south
const LNG_RANGE = 0.2; // ~20km east-west

/**
 * Generate camera locations with full information
 * @returns Array of camera information
 */
const generateCameraLocations = (): CameraInfo[] => {
  const locations: CameraInfo[] = [];
  
  for (let i = 0; i < CAMERA_CONFIG.TOTAL_CAMERAS; i++) {
    const id = `camera-${String(i + 1).padStart(2, '0')}`;
    const lat = HCMC_CENTER.lat + (Math.random() - 0.5) * LAT_RANGE;
    const lng = HCMC_CENTER.lng + (Math.random() - 0.5) * LNG_RANGE;
    
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
    const ward = WARDS[Math.floor(Math.random() * WARDS.length)];
    const street = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    
    const name = `Camera GT ${district} - ${ward}`;
    const address = `${streetNumber} ${street}, ${ward}, ${district}, TP.HCM`;
    
    locations.push({
      id,
      name,
      address,
      ward,
      district,
      lat,
      lng,
    });
  }
  
  return locations;
};

// Generate and export camera locations (generated once)
export const CAMERA_LOCATIONS: CameraInfo[] = generateCameraLocations();

/**
 * Generate timestamps for the last N hours with specified interval
 * @returns Array of ISO timestamp strings
 */
export const generateTimestamps = (): string[] => {
  const timestamps: string[] = [];
  const now = new Date();
  const { INTERVAL_MINUTES, TOTAL_STEPS } = TIME_CONFIG;
  
  for (let i = TOTAL_STEPS; i >= 0; i--) {
    const time = new Date(now.getTime() - i * INTERVAL_MINUTES * 60 * 1000);
    timestamps.push(time.toISOString());
  }
  
  return timestamps;
};

/**
 * Generate random rain level based on probability weights
 * @returns RainLevel (0, 1, or 2)
 */
const getRandomRainLevel = (): RainLevel => {
  const rand = Math.random();
  const { NO_RAIN_PROBABILITY, LIGHT_RAIN_PROBABILITY } = RAIN_LEVEL_CONFIG;
  
  if (rand < NO_RAIN_PROBABILITY) {
    return RAIN_LEVEL_CONFIG.NO_RAIN;
  }
  if (rand < NO_RAIN_PROBABILITY + LIGHT_RAIN_PROBABILITY) {
    return RAIN_LEVEL_CONFIG.LIGHT_RAIN;
  }
  return RAIN_LEVEL_CONFIG.HEAVY_RAIN;
};

/**
 * Generate mock rain data for a specific timestamp
 * @param timestamp - ISO timestamp string
 * @returns Array of rain data points
 */
export const getRainDataForTimestamp = (timestamp: string): RainDataPoint[] => {
  return CAMERA_LOCATIONS.map((camera) => ({
    id: camera.id,
    lat: camera.lat,
    lng: camera.lng,
    rainLevel: getRandomRainLevel(),
    timestamp,
  }));
};

/**
 * Generate all mock data for all timestamps
 * @returns Record mapping timestamp to rain data points
 */
export const generateAllMockData = (): Record<string, RainDataPoint[]> => {
  const timestamps = generateTimestamps();
  const data: Record<string, RainDataPoint[]> = {};
  
  timestamps.forEach((timestamp) => {
    data[timestamp] = getRainDataForTimestamp(timestamp);
  });
  
  return data;
};

/**
 * Get camera information by ID
 * @param id - Camera ID
 * @returns CameraInfo or undefined if not found
 */
export const getCameraInfo = (id: string): CameraInfo | undefined => {
  return CAMERA_LOCATIONS.find((camera) => camera.id === id);
};

/**
 * Get all unique districts from camera locations
 * @returns Sorted array of unique district names
 */
export const getAllDistricts = (): string[] => {
  return Array.from(new Set(CAMERA_LOCATIONS.map((c) => c.district))).sort();
};

/**
 * Get all unique wards from camera locations
 * @returns Sorted array of unique ward names
 */
export const getAllWards = (): string[] => {
  return Array.from(new Set(CAMERA_LOCATIONS.map((c) => c.ward))).sort();
};
