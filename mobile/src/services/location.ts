import type { Ward } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const buildHeaders = (token?: string): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const apiCall = async <T>(endpoint: string, token?: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as T;
};

export const locationService = {
  async getWards(token?: string): Promise<ApiResponse<Ward[]>> {
    try {
      const data = await apiCall<Ward[]>("/api/Location/wards", token);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getWardById(id: string, token?: string): Promise<ApiResponse<Ward>> {
    try {
      const data = await apiCall<Ward>(`/api/Location/wards/${id}`, token);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getDistricts(token?: string): Promise<ApiResponse<string[]>> {
    try {
      const data = await apiCall<string[]>("/api/Location/districts", token);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getWardsByDistrict(
    districtName: string,
    token?: string,
  ): Promise<ApiResponse<Ward[]>> {
    try {
      const encodedDistrictName = encodeURIComponent(districtName);
      const data = await apiCall<Ward[]>(
        `/api/Location/wards/by-district/${encodedDistrictName}`,
        token,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
