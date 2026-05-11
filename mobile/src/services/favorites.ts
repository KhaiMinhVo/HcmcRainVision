/**
 * Favorite Service — wraps all /api/Favorite endpoints.
 *
 * All methods require a valid Bearer token.
 * A 401 is surfaced as a user-friendly error string instead of throwing.
 */

import apiClient from "../api/client";
import { Camera } from "../types/camera";

interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function parseError(error: any, fallback: string): string {
  if (error?.response?.status === 401) {
    return "Unauthorized. Please log in again.";
  }
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallback
  );
}

export const favoriteService = {
  /**
   * GET /api/Favorite
   * Returns all cameras the authenticated user has favorited.
   */
  async getFavorites(token: string): Promise<ServiceResult<Camera[]>> {
    try {
      const response = await apiClient.get<Camera[]>("/api/Favorite", {
        headers: authHeaders(token),
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: parseError(error, "Failed to fetch favorites"),
      };
    }
  },

  /**
   * POST /api/Favorite/{cameraId}
   * Adds a camera to the user's favorites.
   */
  async addFavorite(cameraId: string, token: string): Promise<ServiceResult> {
    try {
      await apiClient.post(
        `/api/Favorite/${cameraId}`,
        {},
        { headers: authHeaders(token) },
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: parseError(error, "Failed to add favorite"),
      };
    }
  },

  /**
   * DELETE /api/Favorite/{cameraId}
   * Removes a camera from the user's favorites.
   */
  async removeFavorite(
    cameraId: string,
    token: string,
  ): Promise<ServiceResult> {
    try {
      await apiClient.delete(`/api/Favorite/${cameraId}`, {
        headers: authHeaders(token),
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: parseError(error, "Failed to remove favorite"),
      };
    }
  },
};
