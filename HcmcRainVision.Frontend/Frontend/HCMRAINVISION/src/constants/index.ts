/**
 * Application constants
 */

/**
 * Ho Chi Minh City center coordinates
 */
export const HCMC_CENTER = {
  lat: 10.8231,
  lng: 106.6297,
} as const;

/**
 * Map configuration
 */
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 12,
  MIN_ZOOM_ON_SELECT: 14,
} as const;

/**
 * Heatmap layer options (leaflet-heat)
 */
export const HEATMAP_CONFIG = {
  RADIUS: 25,
  BLUR: 15,
  MAX: 1,
} as const;

/**
 * Time configuration
 */
export const TIME_CONFIG = {
  HOURS_BACK: 2,
  INTERVAL_MINUTES: 5,
  TOTAL_STEPS: 24, // 2 hours * 60 minutes / 5 minutes
} as const;

/**
 * Camera configuration
 */
export const CAMERA_CONFIG = {
  TOTAL_CAMERAS: 30,
} as const;

/**
 * Rain level configuration
 */
export const RAIN_LEVEL_CONFIG = {
  NO_RAIN: 0,
  LIGHT_RAIN: 1,
  HEAVY_RAIN: 2,
  // Probability weights for random generation
  NO_RAIN_PROBABILITY: 0.5,
  LIGHT_RAIN_PROBABILITY: 0.3,
  HEAVY_RAIN_PROBABILITY: 0.2,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  SIDEBAR_WIDTH: {
    MOBILE: 'w-80',
    DESKTOP: 'w-80 lg:w-96',
  },
  Z_INDEX: {
    MAP: 0,
    OVERLAY: 30,
    SIDEBAR: 40,
    DETAIL_PANEL: 50,
    HEADER: 50,
    LEGEND: 1000,
  },
} as const;

/**
 * LocalStorage keys for persistence
 */
export const STORAGE_KEYS = {
  USER: 'hcm_rain_user',
  TOKEN: 'hcm_rain_token',
  REMEMBER_ME: 'hcm_rain_remember_me',
  FAVORITES: 'hcm_rain_favorites',
  NOTIFICATIONS: 'hcm_rain_notifications',
  NOTIFICATION_SETTINGS: 'hcm_rain_notification_settings',
} as const;

/** Default request timeout in ms (backend free tier có thể cold-start chậm) */
export const API_TIMEOUT_MS = 30_000;

