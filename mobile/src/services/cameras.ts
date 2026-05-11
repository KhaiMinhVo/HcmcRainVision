// Camera Service for API calls
import apiClient from "../api/client";
import { Camera, CameraApiParams, CameraListResponse } from "../types/camera";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateCameraPayload {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  wardId: string;
  streamUrl: string;
  streamType: string;
}

export interface UpdateCameraPayload {
  name: string;
  latitude: number;
  longitude: number;
  wardId: string;
  status: string;
  streamUrl: string;
}

export interface RunAiTestPayload {
  saveWeatherLog: boolean;
}

export interface RunAiTestResponse {
  message?: string;
  prediction: string;
  confidenceScore: string;
  isAIWorking: boolean;
}

export const cameraService = {
  /**
   * Get list of cameras with pagination and search
   * @param params - page, pageSize, search
   * @returns CameraListResponse
   */
  async getCameras(
    params?: CameraApiParams,
  ): Promise<ApiResponse<CameraListResponse>> {
    try {
      const queryParams: Record<string, any> = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      };

      const response = await apiClient.get<CameraListResponse>("/api/Camera", {
        params: queryParams,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch cameras",
      };
    }
  },

  /**
   * Get camera by ID
   * @param id - camera ID
   * @returns Camera
   */
  async getCameraById(id: string | number): Promise<ApiResponse<Camera>> {
    try {
      const response = await apiClient.get<Camera>(`/api/Camera/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch camera",
      };
    }
  },

  /**
   * Get all cameras (fetch all pages)
   * @param search - optional search term
   * @returns Camera[]
   */
  async getAllCameras(search?: string): Promise<ApiResponse<Camera[]>> {
    try {
      const requestedPageSize = 100; // Request large page size, backend may cap it
      const firstPage = await apiClient.get<CameraListResponse>("/api/Camera", {
        params: { page: 1, pageSize: requestedPageSize, ...(search ? { search } : {}) },
      });

      let allCameras = [...firstPage.data.data];
      // IMPORTANT: use actual pageSize returned by backend (some backends cap pageSize, e.g. 10)
      const actualPageSize = Math.max(1, firstPage.data.pageSize || requestedPageSize);
      const totalPages = Math.ceil(firstPage.data.total / actualPageSize);

      // Fetch remaining pages if needed
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            apiClient.get<CameraListResponse>("/api/Camera", {
              params: { page, pageSize: actualPageSize, ...(search ? { search } : {}) },
            }),
          );
        }
        const results = await Promise.all(promises);
        results.forEach((result) => {
          allCameras = [...allCameras, ...result.data.data];
        });
      }

      return { success: true, data: allCameras };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch all cameras",
      };
    }
  },

  /**
   * Get nearby cameras (if backend supports this endpoint)
   * @param latitude
   * @param longitude
   * @param radius - in km
   * @returns Camera[]
   */
  async getNearbyCameras(
    latitude: number,
    longitude: number,
    radius: number = 5,
  ): Promise<ApiResponse<Camera[]>> {
    try {
      const response = await apiClient.get<Camera[]>(
        `/api/Camera/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch nearby cameras",
      };
    }
  },

  /**
   * Update camera status (if backend supports this endpoint)
   * @param id - camera ID
   * @param status - new status
   * @returns Camera
   */
  async updateCameraStatus(
    id: string | number,
    status: string,
  ): Promise<ApiResponse<Camera>> {
    try {
      const response = await apiClient.put<Camera>(`/api/Camera/${id}/status`, {
        status,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update camera status",
      };
    }
  },

  /**
   * Create camera
   * POST /api/Camera
   */
  async createCamera(
    payload: CreateCameraPayload,
  ): Promise<ApiResponse<Camera>> {
    try {
      const response = await apiClient.post<Camera>("/api/Camera", payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create camera",
      };
    }
  },

  /**
   * Update camera
   * PUT /api/Camera/{id}
   */
  async updateCamera(
    id: string | number,
    payload: UpdateCameraPayload,
  ): Promise<ApiResponse<Camera>> {
    try {
      const response = await apiClient.put<Camera>(`/api/Camera/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update camera",
      };
    }
  },

  /**
   * Delete camera
   * DELETE /api/Camera/{id}
   */
  async deleteCamera(id: string | number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete(`/api/Camera/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete camera",
      };
    }
  },

  /**
   * Run AI test for camera
   * POST /api/Camera/{id}/run-ai-test
   */
  async runAiTest(
    id: string | number,
    payload: RunAiTestPayload = { saveWeatherLog: true },
  ): Promise<ApiResponse<RunAiTestResponse>> {
    try {
      const response = await apiClient.post<RunAiTestResponse>(
        `/api/Camera/${id}/run-ai-test`,
        payload,
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to run AI test for camera",
      };
    }
  },
};
