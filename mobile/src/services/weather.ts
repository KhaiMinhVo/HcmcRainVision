const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface WeatherReportPayload {
  cameraId: string;
  isRaining: boolean;
  note?: string;
}

interface RoutePoint {
  lat: number;
  lng: number;
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

const parseResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!bodyText) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(bodyText);
    } catch {
      return { message: bodyText };
    }
  }

  return { message: bodyText };
};

const request = async <T>(
  endpoint: string,
  method: "GET" | "POST",
  token?: string,
  data?: unknown,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: buildHeaders(token),
    body: data ? JSON.stringify(data) : undefined,
  });

  const responseData = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      responseData?.message || `HTTP error! status: ${response.status}`,
    );
  }

  return responseData as T;
};

export interface WeatherAiResult {
  message: string;
  prediction: string;
  confidenceScore: string;
  isAIWorking: boolean;
}

export const weatherService = {
  async getLatest(token?: string): Promise<ApiResponse> {
    try {
      const data = await request<any>("/api/Weather/latest", "GET", token);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async report(
    payload: WeatherReportPayload,
    token?: string,
  ): Promise<ApiResponse<{ message?: string }>> {
    try {
      const data = await request<{ message?: string }>(
        "/api/Weather/report",
        "POST",
        token,
        payload,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async checkRoute(points: RoutePoint[], token?: string): Promise<ApiResponse> {
    try {
      const data = await request<any>(
        "/api/Weather/check-route",
        "POST",
        token,
        points,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getHeatmap(token?: string): Promise<ApiResponse<any[]>> {
    try {
      const data = await request<any[]>("/api/Weather/heatmap", "GET", token);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * POST /api/Weather/test-ai
   * Gửi ảnh (multipart/form-data) lên AI model để dự đoán mưa.
   * image phải là file local (uri: file://...) trên thiết bị.
   */
  async testWeatherByImage(
    image: { uri: string; name?: string; type?: string },
    token?: string,
  ): Promise<ApiResponse<WeatherAiResult>> {
    try {
      const form = new FormData();
      form.append("ImageFile", {
        uri: image.uri,
        name: image.name || "camera.jpg",
        type: image.type || "image/jpeg",
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/Weather/test-ai`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });

      const data = (await parseResponse(response)) as WeatherAiResult;

      if (!response.ok) {
        throw new Error(
          (data as any)?.message || `HTTP error! status: ${response.status}`,
        );
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
