/**
 * Type definitions for the HCMC Rain Detection System
 */

/**
 * Rain level enumeration
 * 0 = No rain
 * 1 = Light rain
 * 2 = Heavy rain
 */
export type RainLevel = 0 | 1 | 2;

/**
 * Rain data point from a camera at a specific timestamp
 */
export interface RainDataPoint {
  id: string;
  lat: number;
  lng: number;
  rainLevel: RainLevel;
  timestamp: string;
}

/**
 * Camera information
 */
export interface CameraInfo {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  /** Ward ID for API (e.g. GET /api/location/wards/{id}) */
  wardId?: string;
  lat: number;
  lng: number;
  /** URL for camera snapshot/image (from backend StreamUrl) */
  streamUrl?: string | null;
}

/**
 * Rain filter options
 */
export type RainFilter = 'all' | 'rain' | 'no-rain';

/**
 * User (from API auth/me or login)
 */
export interface User {
  id: number | string;
  username: string;
  email: string;
  name: string; // display name: FullName ?? Username
  role?: string;
  avatar?: string;
  fullName?: string | null;
  phoneNumber?: string | null;
}

/**
 * Single notification item
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'rain' | 'heavy_rain';
  ward?: string;
}

/**
 * Notification subscription settings
 */
export interface NotificationSettings {
  wardIds: string[]; // ward names (e.g. "Phường 1")
  alertOnRain: boolean;
  alertOnHeavyRain: boolean;
}

