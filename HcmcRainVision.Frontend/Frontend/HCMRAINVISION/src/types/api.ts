/**
 * API request/response DTOs aligned with backend
 */

/** POST /api/auth/register */
export interface RegisterDto {
  Username: string;
  Email: string;
  Password: string;
}

/** POST /api/auth/login */
export interface LoginDto {
  Username: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

/** POST /api/auth/forgot-password */
export interface ForgotPasswordDto {
  Email: string;
}

/** POST /api/auth/reset-password */
export interface ResetPasswordDto {
  Token: string;
  NewPassword: string;
}

/** GET /api/auth/me response */
export interface UserProfileDto {
  Id: number;
  Username: string;
  Email: string;
  FullName: string | null;
  PhoneNumber: string | null;
  AvatarUrl: string | null;
  Role: string;
}

/** PUT /api/auth/me */
export interface UpdateProfileDto {
  FullName?: string | null;
  PhoneNumber?: string | null;
  AvatarUrl?: string | null;
}

/** POST /api/auth/change-password */
export interface ChangePasswordDto {
  OldPassword: string;
  NewPassword: string;
}

/** Backend Camera entity (GET /api/camera item) */
export interface CameraDto {
  Id: string;
  Name: string;
  Latitude: number;
  Longitude: number;
  WardId?: string | null;
  Status?: string | null;
  StreamUrl?: string | null;
}

/** POST /api/weather/report */
export interface ReportDto {
  CameraId: string;
  IsRaining: boolean;
  Note?: string | null;
}

/** POST /api/weather/check-route */
export interface RoutePointDto {
  Lat: number;
  Lng: number;
}

/** GET /api/weather/latest item */
export interface WeatherLatestItemDto {
  Id: number;
  CameraId: string;
  Latitude: number;
  Longitude: number;
  IsRaining: boolean;
  Confidence: number;
  TimeAgo: string;
  /** ISO 8601 timestamp của lần scan gần nhất */
  Timestamp: string;
}

/** GET /api/weather/heatmap item */
export interface HeatmapPointDto {
  Lat: number;
  Lng: number;
  Intensity: number;
}

/** GET /api/weather/raining-cameras item */
export interface RainingCameraDto {
  CameraId: string;
  CameraName: string;
  Latitude: number;
  Longitude: number;
  WardId?: string | null;
  CameraStatus?: string | null;
  Confidence: number;
  LastRainAtUtc: string;
  ImageUrl?: string | null;
}

/** POST /api/camera (Admin) */
export interface CreateCameraRequest {
  Id: string;
  Name: string;
  Latitude: number;
  Longitude: number;
  WardId?: string | null;
  StreamUrl: string;
  StreamType?: string | null;
}

/** PUT /api/camera/{id} (Admin) */
export interface UpdateCameraRequest {
  Name: string;
  Latitude: number;
  Longitude: number;
  WardId?: string | null;
  Status?: string | null;
  StreamUrl?: string | null;
}

/** POST /api/subscriptions */
export interface CreateSubscriptionDto {
  WardId: string;
  ThresholdProbability?: number;
}

/** PUT /api/subscriptions/{id} */
export interface UpdateSubscriptionDto {
  ThresholdProbability: number;
  IsEnabled: boolean;
}

/** GET /api/subscriptions item */
export interface AlertSubscriptionResponseDto {
  SubscriptionId: string;
  WardId: string;
  WardName: string;
  DistrictName: string | null;
  ThresholdProbability: number;
  IsEnabled: boolean;
  CreatedAt: string;
}

/** GET /api/location/wards item */
export interface WardDto {
  WardId: string;
  WardName: string;
  DistrictName: string | null;
}

/** GET /api/location/wards/{id} – ward detail */
export interface WardDetailDto {
  WardId: string;
  WardName: string;
  DistrictName: string | null;
  CreatedAt?: string | null;
  UpdatedAt?: string | null;
}

// --- Admin API types ---

/** GET /api/admin/stats */
export interface AdminStatsDto {
  TotalCameras: number;
  TotalWeatherLogs: number;
  TotalUserReports: number;
  LastSystemScan: string | null;
  SystemStatus: string;
}

/** GET /api/admin/stats/rain-frequency item */
export interface RainFrequencyItemDto {
  Hour: number;
  Count: number;
}

/** GET /api/admin/stats/failed-cameras */
export interface FailedCamerasDto {
  TotalFailed: number;
  Cameras: Array<{
    Id: string;
    Name: string;
    StreamUrl: string;
    Latitude: number;
    Longitude: number;
    Status: string;
  }>;
}

/** GET /api/admin/stats/check-camera-health */
export interface CameraHealthSummaryDto {
  TotalCameras: number;
  Active: number;
  Offline: number;
  Maintenance: number;
  TestMode: number;
  CheckedAt: string;
  Note: string;
}

export interface CameraHealthDetailDto {
  Id: string;
  Name: string;
  Status: string;
  LastChecked: string | null;
  Reason: string | null;
  StreamUrl: string;
}

export interface CameraHealthDto {
  Summary: CameraHealthSummaryDto;
  Details: CameraHealthDetailDto[];
}

/** GET /api/admin/audit-data item */
export interface AuditDataItemDto {
  ReportId: number;
  CameraId: string;
  UserSaid: string;
  AISaid: string;
  AIConfidence: number;
  ImageUrl: string | null;
  ReportTime: string;
  Note: string | null;
}

/** GET /api/admin/users item */
export interface UserAdminViewDto {
  Id: number;
  Username: string;
  Email: string;
  FullName: string | null;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
}

/** GET /api/admin/ingestion-jobs */
export interface IngestionJobListItemDto {
  JobId: string;
  JobType: string;
  Status: string;
  StartedAt: string;
  EndedAt: string | null;
  Duration: number | null;
  Notes: string | null;
  TotalAttempts: number;
  SuccessfulAttempts: number;
  FailedAttempts: number;
  AvgLatency: number;
}

export interface IngestionJobsResponseDto {
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  Jobs: IngestionJobListItemDto[];
}

/** GET /api/admin/ingestion-jobs/{jobId} */
export interface IngestionAttemptDto {
  AttemptId: number;
  CameraId: string;
  Status: string;
  LatencyMs: number;
  HttpStatus: number | null;
  ErrorMessage: string | null;
  AttemptAt: string;
}

export interface IngestionJobDetailDto {
  JobId: string;
  JobType: string;
  Status: string;
  StartedAt: string;
  EndedAt: string | null;
  Duration: number | null;
  Notes: string | null;
  Attempts: IngestionAttemptDto[];
}

/** GET /api/admin/ingestion-stats */
export interface IngestionStatsDto {
  Period: string;
  Jobs: {
    Total: number;
    Completed: number;
    Failed: number;
    SuccessRate: number;
  };
  Attempts: {
    Total: number;
    Successful: number;
    Failed: number;
    SuccessRate: number;
    AvgLatency: number;
  };
  ProblematicCameras: Array<{
    CameraId: string;
    TotalAttempts: number;
    FailedAttempts: number;
    ErrorRate: number;
    AvgLatency: number;
  }>;
}
