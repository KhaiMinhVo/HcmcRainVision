// Shared type definitions for the application

export interface Camera {
  id: string;
  name?: string;
  district: string;
  area: string;
  lastUpdated: string | Date;
  weatherStatus?: WeatherStatus | string;
  rainStatus: "heavy" | "medium" | "light" | "none" | string;
  isOnline?: boolean;
  isFavorite?: boolean;
  distance?: number | string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  cameraCount: number;
  weatherStatus?: WeatherStatus | string;
  rainStatus: "heavy" | "medium" | "light" | "none" | string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  area: string;
  timestamp: string | Date;
  severity: "high" | "medium" | "low" | string;
  isRead?: boolean;
  weatherStatus?: WeatherStatus | string;
  [key: string]: any;
}

export interface Ward {
  wardId: string;
  wardName: string;
  districtName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlertSubscription {
  subscriptionId: string;
  wardId: string;
  wardName: string;
  districtName: string;
  thresholdProbability: number;
  isEnabled: boolean;
  createdAt: string;
}

export type WeatherStatus = "heavy" | "medium" | "light" | "none";
export type RainStatus = "heavy" | "medium" | "light" | "none";
export type BadgeVariant =
  | "heavy"
  | "medium"
  | "light"
  | "none"
  | "high"
  | "medium"
  | "low"
  | "info";
export type StatusType =
  | "heavy"
  | "medium"
  | "light"
  | "none"
  | "high"
  | "medium"
  | "low"
  | "online"
  | "offline";
