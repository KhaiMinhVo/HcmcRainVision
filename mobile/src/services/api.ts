// API Service for backend communication using axios
import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

class ApiService {
  private axiosInstance: AxiosInstance;
  private apiKey: string | null;

  constructor() {
    this.apiKey = null;
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers.Authorization = `Bearer ${this.apiKey}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error("API Error Response:", error.response.data);
        } else if (error.request) {
          console.error("API No Response:", error.request);
        } else {
          console.error("API Error:", error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  // Set auth token
  setAuthToken(token: string | null) {
    this.apiKey = token;
  }

  // Get headers with API key if available
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async get<T = any>(endpoint: string, params?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error("API GET error:", error);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`API POST ${API_BASE_URL}${endpoint}`, data);
      const response = await this.axiosInstance.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error("API POST error:", error);
      throw error;
    }
  }

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      console.error("API DELETE error:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(username: string, password: string): Promise<any> {
    return this.post("/api/Auth/login", { username, password });
  }

  async register(userData: any): Promise<any> {
    return this.post("/api/Auth/register", userData);
  }

  async logout(): Promise<any> {
    return this.post("/api/Auth/logout", {});
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.post("/auth/refresh", { refreshToken });
  }

  // Camera endpoints
  async getCameras(): Promise<any> {
    return this.get("/cameras");
  }

  async getCameraById(id: string): Promise<any> {
    return this.get(`/cameras/${id}`);
  }

  async getNearbyCameras(
    latitude: number,
    longitude: number,
    radius: number = 5,
  ): Promise<any> {
    return this.get(
      `/cameras/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
    );
  }

  // Area endpoints
  async getAreas(): Promise<any> {
    return this.get("/areas");
  }

  async getAreaById(id: string): Promise<any> {
    return this.get(`/areas/${id}`);
  }

  // Weather endpoints
  async getLatestWeather(): Promise<any> {
    return this.get("/api/Weather/latest");
  }

  async reportWeather(data: {
    cameraId: string;
    isRaining: boolean;
    note?: string;
  }): Promise<any> {
    return this.post("/api/Weather/report", data);
  }

  async checkWeatherRoute(
    points: Array<{ lat: number; lng: number }>,
  ): Promise<any> {
    return this.post("/api/Weather/check-route", points);
  }

  async getWeatherHeatmap(): Promise<any> {
    return this.get("/api/Weather/heatmap");
  }

  // Backward-compatible shim for old callers.
  async getRainOverlay(): Promise<any> {
    return this.getWeatherHeatmap();
  }

  // Alerts endpoints
  async getAlerts(): Promise<any> {
    return this.get("/alerts");
  }

  async markAlertAsRead(id: string): Promise<any> {
    return this.post(`/alerts/${id}/read`, {});
  }

  // Location endpoints
  async getWards(): Promise<any> {
    return this.get("/api/Location/wards");
  }

  async getWardById(id: string): Promise<any> {
    return this.get(`/api/Location/wards/${id}`);
  }

  async getDistricts(): Promise<any> {
    return this.get("/api/Location/districts");
  }

  async getWardsByDistrict(districtName: string): Promise<any> {
    return this.get(
      `/api/Location/wards/by-district/${encodeURIComponent(districtName)}`,
    );
  }

  // Alert subscription endpoints
  async getSubscriptions(): Promise<any> {
    return this.get("/api/subscriptions");
  }

  async createSubscription(data: {
    wardId: string;
    thresholdProbability: number;
  }): Promise<any> {
    return this.post("/api/subscriptions", data);
  }

  async updateSubscription(
    id: string,
    data: { thresholdProbability: number; isEnabled: boolean },
  ): Promise<any> {
    return this.put(`/api/subscriptions/${id}`, data);
  }

  async deleteSubscription(id: string): Promise<any> {
    return this.delete(`/api/subscriptions/${id}`);
  }
}

export default new ApiService();
