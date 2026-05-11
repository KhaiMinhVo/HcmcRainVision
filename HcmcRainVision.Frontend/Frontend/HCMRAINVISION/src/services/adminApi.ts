/**
 * Admin API – stats, users, audit, camera CRUD, ingestion jobs.
 * All endpoints require [Authorize(Roles = "Admin")].
 * Responses are normalized (PascalCase) from BE (PascalCase or camelCase).
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type {
  AdminStatsDto,
  RainFrequencyItemDto,
  FailedCamerasDto,
  CameraHealthDto,
  CameraHealthSummaryDto,
  CameraHealthDetailDto,
  AuditDataItemDto,
  UserAdminViewDto,
  IngestionJobsResponseDto,
  IngestionJobDetailDto,
  IngestionAttemptDto,
  IngestionStatsDto,
} from '../types/api';
import type { CreateCameraRequest, UpdateCameraRequest } from '../types/api';

const prefix = 'api/Admin';

type UnknownRecord = Record<string, unknown>;

/** Read property with Pascal or camel key */
function prop<T>(o: UnknownRecord | null | undefined, pascal: string, camel: string): T | undefined {
  if (o == null) return undefined;
  const v = o[pascal] ?? o[camel];
  return v as T | undefined;
}

/** GET /api/admin/stats – system overview stats */
export async function getAdminStats(): Promise<AdminStatsDto> {
  const raw = await apiGet<UnknownRecord>(`${prefix}/stats`);
  return {
    TotalCameras: Number(prop<number>(raw, 'TotalCameras', 'totalCameras') ?? 0),
    TotalWeatherLogs: Number(prop<number>(raw, 'TotalWeatherLogs', 'totalWeatherLogs') ?? 0),
    TotalUserReports: Number(prop<number>(raw, 'TotalUserReports', 'totalUserReports') ?? 0),
    LastSystemScan: (prop<string>(raw, 'LastSystemScan', 'lastSystemScan') ?? null) as string | null,
    SystemStatus: String(prop<string>(raw, 'SystemStatus', 'systemStatus') ?? ''),
  };
}

/** GET /api/admin/users – BE returns { Total, Page, PageSize, Data }; extract Data and normalize */
export async function getAdminUsers(params?: { page?: number; pageSize?: number }): Promise<UserAdminViewDto[]> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 500;
  const raw = await apiGet<UnknownRecord>(`${prefix}/users?page=${page}&pageSize=${pageSize}`);
  const list = Array.isArray(raw)
    ? raw
    : (prop<unknown[]>(raw, 'Data', 'data') ?? []);
  return list.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      Id: Number(prop<number>(o, 'Id', 'id') ?? 0),
      Username: String(prop<string>(o, 'Username', 'username') ?? ''),
      Email: String(prop<string>(o, 'Email', 'email') ?? ''),
      FullName: (prop<string>(o, 'FullName', 'fullName') ?? null) as string | null,
      Role: String(prop<string>(o, 'Role', 'role') ?? ''),
      IsActive: Boolean(prop<boolean>(o, 'IsActive', 'isActive') ?? true),
      CreatedAt: String(prop<string>(o, 'CreatedAt', 'createdAt') ?? ''),
    };
  });
}

/** GET /api/admin/stats/rain-frequency */
export async function getRainFrequency(): Promise<RainFrequencyItemDto[]> {
  const raw = await apiGet<unknown>(`${prefix}/stats/rain-frequency`);
  const list = Array.isArray(raw) ? raw : [];
  return list.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      Hour: Number(prop<number>(o, 'Hour', 'hour') ?? 0),
      Count: Number(prop<number>(o, 'Count', 'count') ?? 0),
    };
  });
}

/** GET /api/admin/stats/failed-cameras */
export async function getFailedCameras(): Promise<FailedCamerasDto> {
  const raw = await apiGet<UnknownRecord>(`${prefix}/stats/failed-cameras`);
  const camerasRaw = prop<unknown[]>(raw, 'Cameras', 'cameras') ?? [];
  const Cameras = camerasRaw.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      Id: String(prop<string>(o, 'Id', 'id') ?? ''),
      Name: String(prop<string>(o, 'Name', 'name') ?? ''),
      StreamUrl: String(prop<string>(o, 'StreamUrl', 'streamUrl') ?? ''),
      Latitude: Number(prop<number>(o, 'Latitude', 'latitude') ?? 0),
      Longitude: Number(prop<number>(o, 'Longitude', 'longitude') ?? 0),
      Status: String(prop<string>(o, 'Status', 'status') ?? ''),
    };
  });
  return {
    TotalFailed: Number(prop<number>(raw, 'TotalFailed', 'totalFailed') ?? Cameras.length),
    Cameras,
  };
}

/** GET /api/admin/stats/check-camera-health */
export async function checkCameraHealth(): Promise<CameraHealthDto> {
  const raw = await apiGet<UnknownRecord>(`${prefix}/stats/check-camera-health`);
  const sum = (prop<UnknownRecord>(raw, 'Summary', 'summary') ?? {}) as UnknownRecord;
  const detailsRaw = prop<unknown[]>(raw, 'Details', 'details') ?? [];
  const Summary: CameraHealthSummaryDto = {
    TotalCameras: Number(prop<number>(sum, 'TotalCameras', 'totalCameras') ?? 0),
    Active: Number(prop<number>(sum, 'Active', 'active') ?? 0),
    Offline: Number(prop<number>(sum, 'Offline', 'offline') ?? 0),
    Maintenance: Number(prop<number>(sum, 'Maintenance', 'maintenance') ?? 0),
    TestMode: Number(prop<number>(sum, 'TestMode', 'testMode') ?? 0),
    CheckedAt: String(prop<string>(sum, 'CheckedAt', 'checkedAt') ?? ''),
    Note: String(prop<string>(sum, 'Note', 'note') ?? ''),
  };
  const Details: CameraHealthDetailDto[] = detailsRaw.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      Id: String(prop<string>(o, 'Id', 'id') ?? ''),
      Name: String(prop<string>(o, 'Name', 'name') ?? ''),
      Status: String(prop<string>(o, 'Status', 'status') ?? ''),
      LastChecked: (prop<string>(o, 'LastChecked', 'lastChecked') ?? null) as string | null,
      Reason: (prop<string>(o, 'Reason', 'reason') ?? null) as string | null,
      StreamUrl: String(prop<string>(o, 'StreamUrl', 'streamUrl') ?? ''),
    };
  });
  return { Summary, Details };
}

/** GET /api/admin/audit-data – user reports for review */
export async function getAuditData(): Promise<AuditDataItemDto[]> {
  const raw = await apiGet<unknown>(`${prefix}/audit-data`);
  const list = Array.isArray(raw) ? raw : [];
  return list.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    const reportTime = prop<string>(o, 'ReportTime', 'reportTime');
    return {
      ReportId: Number(prop<number>(o, 'ReportId', 'reportId') ?? 0),
      CameraId: String(prop<string>(o, 'CameraId', 'cameraId') ?? ''),
      UserSaid: String(prop<string>(o, 'UserSaid', 'userSaid') ?? ''),
      AISaid: String(prop<string>(o, 'AISaid', 'aiSaid') ?? ''),
      AIConfidence: Number(prop<number>(o, 'AIConfidence', 'aiConfidence') ?? 0),
      ImageUrl: (prop<string>(o, 'ImageUrl', 'imageUrl') ?? null) as string | null,
      ReportTime: reportTime != null ? (typeof reportTime === 'string' ? reportTime : new Date(reportTime as Date).toISOString()) : '',
      Note: (prop<string>(o, 'Note', 'note') ?? null) as string | null,
    };
  });
}

/** PUT /api/admin/users/{id}/ban – toggle ban */
export async function toggleBanUser(id: number): Promise<{ message: string }> {
  return apiPut<{ message: string }>(`${prefix}/users/${id}/ban`, {});
}

/** GET /api/admin/ingestion-jobs (paginated) – BE returns { Page, PageSize, TotalCount, TotalPages, Jobs } */
export async function getIngestionJobs(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<IngestionJobsResponseDto> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.pageSize != null) sp.set('pageSize', String(params.pageSize));
  if (params?.status) sp.set('status', params.status);
  const q = sp.toString();
  const raw = await apiGet<UnknownRecord>(`${prefix}/ingestion-jobs${q ? `?${q}` : ''}`);
  const jobsRaw = prop<unknown[]>(raw, 'Jobs', 'jobs') ?? [];
  const Jobs = jobsRaw.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      JobId: String(prop<string>(o, 'JobId', 'jobId') ?? ''),
      JobType: String(prop<string>(o, 'JobType', 'jobType') ?? ''),
      Status: String(prop<string>(o, 'Status', 'status') ?? ''),
      StartedAt: String(prop<string>(o, 'StartedAt', 'startedAt') ?? ''),
      EndedAt: (prop<string>(o, 'EndedAt', 'endedAt') ?? null) as string | null,
      Duration: (prop<number>(o, 'Duration', 'duration') ?? null) as number | null,
      Notes: (prop<string>(o, 'Notes', 'notes') ?? null) as string | null,
      TotalAttempts: Number(prop<number>(o, 'TotalAttempts', 'totalAttempts') ?? 0),
      SuccessfulAttempts: Number(prop<number>(o, 'SuccessfulAttempts', 'successfulAttempts') ?? 0),
      FailedAttempts: Number(prop<number>(o, 'FailedAttempts', 'failedAttempts') ?? 0),
      AvgLatency: Number(prop<number>(o, 'AvgLatency', 'avgLatency') ?? 0),
    };
  });
  return {
    Page: Number(prop<number>(raw, 'Page', 'page') ?? 1),
    PageSize: Number(prop<number>(raw, 'PageSize', 'pageSize') ?? 20),
    TotalCount: Number(prop<number>(raw, 'TotalCount', 'totalCount') ?? 0),
    TotalPages: Number(prop<number>(raw, 'TotalPages', 'totalPages') ?? 0),
    Jobs,
  };
}

/** GET /api/admin/ingestion-jobs/{jobId} */
export async function getIngestionJobDetail(jobId: string): Promise<IngestionJobDetailDto> {
  const raw = await apiGet<UnknownRecord>(`${prefix}/ingestion-jobs/${encodeURIComponent(jobId)}`);
  const attemptsRaw = prop<unknown[]>(raw, 'Attempts', 'attempts') ?? [];
  const Attempts: IngestionAttemptDto[] = attemptsRaw.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      AttemptId: Number(prop<number>(o, 'AttemptId', 'attemptId') ?? 0),
      CameraId: String(prop<string>(o, 'CameraId', 'cameraId') ?? ''),
      Status: String(prop<string>(o, 'Status', 'status') ?? ''),
      LatencyMs: Number(prop<number>(o, 'LatencyMs', 'latencyMs') ?? 0),
      HttpStatus: (prop<number>(o, 'HttpStatus', 'httpStatus') ?? null) as number | null,
      ErrorMessage: (prop<string>(o, 'ErrorMessage', 'errorMessage') ?? null) as string | null,
      AttemptAt: String(prop<string>(o, 'AttemptAt', 'attemptAt') ?? ''),
    };
  });
  return {
    JobId: String(prop<string>(raw, 'JobId', 'jobId') ?? ''),
    JobType: String(prop<string>(raw, 'JobType', 'jobType') ?? ''),
    Status: String(prop<string>(raw, 'Status', 'status') ?? ''),
    StartedAt: String(prop<string>(raw, 'StartedAt', 'startedAt') ?? ''),
    EndedAt: (prop<string>(raw, 'EndedAt', 'endedAt') ?? null) as string | null,
    Duration: (prop<number>(raw, 'Duration', 'duration') ?? null) as number | null,
    Notes: (prop<string>(raw, 'Notes', 'notes') ?? null) as string | null,
    Attempts,
  };
}

/** GET /api/admin/ingestion-stats?days= */
export async function getIngestionStats(days?: number): Promise<IngestionStatsDto> {
  const q = days != null ? `?days=${days}` : '';
  const raw = await apiGet<UnknownRecord>(`${prefix}/ingestion-stats${q}`);
  const jobsObj = (prop<UnknownRecord>(raw, 'Jobs', 'jobs') ?? {}) as UnknownRecord;
  const attemptsObj = (prop<UnknownRecord>(raw, 'Attempts', 'attempts') ?? {}) as UnknownRecord;
  const problematicRaw = prop<unknown[]>(raw, 'ProblematicCameras', 'problematicCameras') ?? [];
  const ProblematicCameras = problematicRaw.map((item) => {
    const o = (item as UnknownRecord) ?? {};
    return {
      CameraId: String(prop<string>(o, 'CameraId', 'cameraId') ?? ''),
      TotalAttempts: Number(prop<number>(o, 'TotalAttempts', 'totalAttempts') ?? 0),
      FailedAttempts: Number(prop<number>(o, 'FailedAttempts', 'failedAttempts') ?? 0),
      ErrorRate: Number(prop<number>(o, 'ErrorRate', 'errorRate') ?? 0),
      AvgLatency: Number(prop<number>(o, 'AvgLatency', 'avgLatency') ?? 0),
    };
  });
  return {
    Period: String(prop<string>(raw, 'Period', 'period') ?? ''),
    Jobs: {
      Total: Number(prop<number>(jobsObj, 'Total', 'total') ?? 0),
      Completed: Number(prop<number>(jobsObj, 'Completed', 'completed') ?? 0),
      Failed: Number(prop<number>(jobsObj, 'Failed', 'failed') ?? 0),
      SuccessRate: Number(prop<number>(jobsObj, 'SuccessRate', 'successRate') ?? 0),
    },
    Attempts: {
      Total: Number(prop<number>(attemptsObj, 'Total', 'total') ?? 0),
      Successful: Number(prop<number>(attemptsObj, 'Successful', 'successful') ?? 0),
      Failed: Number(prop<number>(attemptsObj, 'Failed', 'failed') ?? 0),
      SuccessRate: Number(prop<number>(attemptsObj, 'SuccessRate', 'successRate') ?? 0),
      AvgLatency: Number(prop<number>(attemptsObj, 'AvgLatency', 'avgLatency') ?? 0),
    },
    ProblematicCameras,
  };
}

/** POST /api/camera – create camera (Admin) */
export async function createCamera(body: CreateCameraRequest): Promise<{ camera: unknown; message: string }> {
  return apiPost<{ camera: unknown; message: string }>('api/Camera', body);
}

/** PUT /api/camera/{id} – update camera (Admin) */
export async function updateCamera(id: string, body: UpdateCameraRequest): Promise<unknown> {
  return apiPut<unknown>(`api/Camera/${encodeURIComponent(id)}`, body);
}

/** DELETE /api/camera/{id} – delete camera (Admin) */
export async function deleteCamera(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`api/Camera/${encodeURIComponent(id)}`);
}
