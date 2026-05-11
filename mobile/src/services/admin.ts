import apiClient from "../api/client";

// Core models
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}

export interface PaginatedData<T> {
    total?: number;
    totalCount?: number;
    totalPages?: number;
    page: number;
    pageSize: number;
    data?: T[];
    jobs?: T[]; // for ingestion jobs
}

export interface AdminStats {
    totalCameras: number;
    totalWeatherLogs: number;
    totalUserReports: number;
    lastSystemScan: string;
    systemStatus: string;
}

export interface AuditData {
    reportId: number;
    cameraId: string;
    userSaid: string;
    aiSaid: string;
    aiConfidence: number;
    imageUrl: string | null;
    reportTime: string;
    note: string | null;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface RainFrequency {
    hour: number;
    count: number;
}

export interface FailedCamera {
    id: string;
    name: string;
    streamUrl: string;
    latitude: number;
    longitude: number;
    status: string;
}

export interface CameraHealth {
    summary: {
        totalCameras: number;
        active: number;
        offline: number;
        maintenance: number;
        testMode: number;
        checkedAt: string;
        note: string;
    };
    details: {
        id: string;
        name: string;
        status: string;
        lastChecked: string;
        reason: string | null;
        streamUrl: string | null;
    }[];
}

export interface IngestionJob {
    jobId: string;
    jobType: string;
    status: string;
    startedAt: string;
    endedAt: string;
    duration: number;
    notes: string;
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    avgLatency: number;
    attempts?: IngestionJobAttempt[];
}

export interface IngestionJobAttempt {
    attemptId: string;
    cameraId: string;
    status: string;
    latencyMs: number;
    httpStatus: number;
    errorMessage: string | null;
    attemptAt: string;
}

export interface IngestionStats {
    period: string;
    jobs: {
        total: number;
        completed: number;
        failed: number;
        successRate: number;
    };
    attempts: {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
        avgLatency: number;
    };
    problematicCameras: {
        cameraId: string;
        totalAttempts: number;
        failedAttempts: number;
        errorRate: number;
        avgLatency: number;
    }[];
}

const handleRequest = async <T>(request: Promise<any>): Promise<ApiResponse<T>> => {
    try {
        const response = await request;
        return {
            success: true,
            data: response.data,
            statusCode: response.status,
        };
    } catch (error: any) {
        if (error.response?.status === 401) {
            return { success: false, error: "Unauthorized access. Valid token required.", statusCode: 401 };
        } else if (error.response?.status === 403) {
            return { success: false, error: "Forbidden. Admin privileges required.", statusCode: 403 };
        }
        return {
            success: false,
            error: error.response?.data?.message || error.message || "An error occurred",
            statusCode: error.response?.status,
        };
    }
};

export const adminService = {
    getStats: (token: string) =>
        handleRequest<AdminStats>(apiClient.get("/api/Admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
        })),

    getAuditData: (token: string) =>
        handleRequest<AuditData[]>(apiClient.get("/api/Admin/audit-data", {
            headers: { Authorization: `Bearer ${token}` }
        })),

    // Search, sort, page, pageSize... currently simple impl
    getUsers: (token: string, page = 1, pageSize = 20, search = "") =>
        handleRequest<PaginatedData<AdminUser>>(apiClient.get("/api/Admin/users", {
            params: { page, pageSize, search },
            headers: { Authorization: `Bearer ${token}` }
        })),

    banUser: (id: number, token: string) =>
        handleRequest<any>(apiClient.put(`/api/Admin/users/${id}/ban`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })),

    getRainFrequency: (token: string) =>
        handleRequest<RainFrequency[]>(apiClient.get("/api/Admin/stats/rain-frequency", {
            headers: { Authorization: `Bearer ${token}` }
        })),

    getFailedCameras: (token: string) =>
        handleRequest<{ totalFailed: number; cameras: FailedCamera[] }>(apiClient.get("/api/Admin/stats/failed-cameras", {
            headers: { Authorization: `Bearer ${token}` }
        })),

    getCameraHealth: (token: string) =>
        handleRequest<CameraHealth>(apiClient.get("/api/Admin/stats/check-camera-health", {
            headers: { Authorization: `Bearer ${token}` }
        })),

    getIngestionJobs: (token: string, page = 1, pageSize = 20) =>
        handleRequest<PaginatedData<IngestionJob>>(apiClient.get("/api/Admin/ingestion-jobs", {
            params: { page, pageSize },
            headers: { Authorization: `Bearer ${token}` }
        })),

    getIngestionJobDetails: (jobId: string, token: string) =>
        handleRequest<IngestionJob>(apiClient.get(`/api/Admin/ingestion-jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })),

    getIngestionStats: (token: string, days = 7) =>
        handleRequest<IngestionStats>(apiClient.get("/api/Admin/ingestion-stats", {
            params: { days },
            headers: { Authorization: `Bearer ${token}` }
        })),
};
