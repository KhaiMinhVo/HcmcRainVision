import { weatherService } from "./weather";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const rainService = {
  // Legacy wrapper kept to avoid breaking old imports.
  async getRainOverlay(token?: string): Promise<ApiResponse> {
    return weatherService.getHeatmap(token);
  },

  async getRainForecast(token?: string): Promise<ApiResponse> {
    return weatherService.getLatest(token);
  },

  async getCurrentRainData(
    _latitude: number,
    _longitude: number,
    token?: string,
  ): Promise<ApiResponse> {
    return weatherService.getLatest(token);
  },
};
