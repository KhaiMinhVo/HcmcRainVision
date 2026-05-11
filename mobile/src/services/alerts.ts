// Get API URL from environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  method: string = "GET",
  data: any = null,
): Promise<any> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`API ${method} ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error(`API ${method} error:`, error);
    throw error;
  }
};

export const alertService = {
  async getAlerts(): Promise<ApiResponse> {
    try {
      const response = await apiCall("/api/alerts");
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async markAlertAsRead(id: string): Promise<ApiResponse> {
    try {
      const response = await apiCall(`/api/alerts/${id}/read`, "POST");
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteAlert(id: string): Promise<ApiResponse> {
    try {
      const response = await apiCall(`/api/alerts/${id}`, "DELETE");
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
