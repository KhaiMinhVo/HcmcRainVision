// Types
interface ApiResponse {
  message?: string;
  [key: string]: any;
}

interface UserData {
  username: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  phoneNumber?: string | null;
  districtName?: string | null;
  wardId?: string | null;
  wardName?: string | null;
}

interface AuthResult {
  success: boolean;
  data?: UserData;
  token?: string;
  error?: string;
  message?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Get API URL from environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

// Set to false to use mock data, true to use real API
const USE_REAL_API = true;

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  method: string = "GET",
  data: any = null,
  token: string | null = null,
): Promise<ApiResponse> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
    };

    // Add Authorization header if token is provided
    if (token) {
      (options.headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`API ${method} ${API_BASE_URL}${endpoint}`, data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Check if response has content before parsing JSON
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    let responseData: ApiResponse | null = null;

    // Only parse JSON if there's content and it's JSON
    if (text && contentType && contentType.includes("application/json")) {
      try {
        responseData = JSON.parse(text);
      } catch (parseError) {
        console.warn("Failed to parse JSON response:", text);
        responseData = { message: text };
      }
    } else if (text) {
      // If there's text but it's not JSON, use it as message
      responseData = { message: text };
    } else {
      // Empty response is OK for successful requests
      responseData = { message: "Success" };
    }

    // Check HTTP status - throw error only for actual failures
    if (!response.ok) {
      throw new Error(
        responseData?.message || `HTTP error! status: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error(`API ${method} error:`, error);
    throw error;
  }
};

export const authService = {
  async login(username: string, password: string): Promise<AuthResult> {
    if (USE_REAL_API) {
      try {
        const response = await apiCall("/api/Auth/login", "POST", {
          username,
          password,
        });
        console.log("Login response:", response);

        // Handle response format from real API
        return {
          success: true,
          data: {
            username: response.username || username,
            name: response.name || response.fullName || username,
            email: response.email || username + "@example.com",
            role: response.role || "User",
            avatarUrl: response.avatarUrl || null,
            districtName: response.districtName || response.district || null,
            wardId: response.wardId || null,
            wardName: response.wardName || response.ward || null,
          },
          token: response.token || response.accessToken || "",
        };
      } catch (error: any) {
        console.error("Login error:", error);

        // Parse error message to provide better user feedback
        let errorMessage = "Login failed. Please try again.";

        if (error.message) {
          const msg = error.message.toLowerCase();

          if (
            msg.includes("401") ||
            msg.includes("unauthorized") ||
            msg.includes("invalid") ||
            msg.includes("incorrect")
          ) {
            errorMessage =
              "Invalid username or password. Please check your credentials and try again.";
          } else if (msg.includes("404") || msg.includes("not found")) {
            errorMessage = "User not found. Please check your username.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (msg.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
          } else {
            errorMessage = error.message;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      // Mock login
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              username: username,
              name: "Nguyen Van A",
              email: username + "@example.com",
              role: "Operator",
              avatarUrl: null,
              districtName: null,
              wardId: null,
              wardName: null,
            },
            token: "mock_token_123",
          });
        }, 1000);
      });
    }
  },

  async register(userData: RegisterData): Promise<AuthResult> {
    if (USE_REAL_API) {
      try {
        const response = await apiCall("/api/Auth/register", "POST", {
          username: userData.username,
          email: userData.email,
          password: userData.password,
        });
        console.log("Register response:", response);

        // API returns { "message": "Đăng ký thành công!" }
        // Return success with user data
        return {
          success: true,
          data: {
            username: userData.username,
            name: userData.username, // Use username as name
            email: userData.email,
            role: "User",
            avatarUrl: null,
            districtName: null,
            wardId: null,
            wardName: null,
          },
          token: response.token || response.accessToken || "",
          message: response.message,
        };
      } catch (error: any) {
        console.error("Register error:", error);

        // Parse error message to provide better user feedback
        let errorMessage = "Registration failed. Please try again.";

        if (error.message) {
          const msg = error.message.toLowerCase();

          if (
            msg.includes("409") ||
            msg.includes("conflict") ||
            msg.includes("exist") ||
            msg.includes("already")
          ) {
            errorMessage =
              "Username or email already exists. Please use a different one.";
          } else if (
            msg.includes("400") ||
            msg.includes("bad request") ||
            msg.includes("invalid")
          ) {
            errorMessage =
              "Invalid information provided. Please check your details.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (msg.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
          } else {
            errorMessage = error.message;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      // Mock registration
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              username: userData.username,
              name: userData.username,
              email: userData.email,
              role: "User",
              avatarUrl: null,
              districtName: null,
              wardId: null,
              wardName: null,
            },
            token: "mock_token_123",
          });
        }, 1000);
      });
    }
  },

  async logout(): Promise<{ success: boolean; error?: string }> {
    if (USE_REAL_API) {
      try {
        await apiCall("/api/Auth/logout", "POST");
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Logout failed",
        };
      }
    } else {
      // Mock logout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 500);
      });
    }
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
    token: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_REAL_API) {
      try {
        const response = await apiCall(
          "/api/Auth/change-password",
          "POST",
          {
            oldPassword,
            newPassword,
          },
          token,
        );
        console.log("Change password response:", response);

        return {
          success: true,
          message: response.message || "Password changed successfully!",
        };
      } catch (error: any) {
        console.error("Change password error:", error);

        // Parse error message to provide better user feedback
        let errorMessage = "Failed to change password. Please try again.";

        if (error.message) {
          const msg = error.message.toLowerCase();

          if (
            msg.includes("401") ||
            msg.includes("unauthorized") ||
            msg.includes("incorrect") ||
            msg.includes("wrong")
          ) {
            errorMessage = "Current password is incorrect. Please try again.";
          } else if (
            msg.includes("400") ||
            msg.includes("bad request") ||
            msg.includes("invalid")
          ) {
            errorMessage = "Invalid password format. Please check your input.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (msg.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
          } else {
            errorMessage = error.message;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      // Mock change password
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: "Password changed successfully!",
          });
        }, 1000);
      });
    }
  },

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_REAL_API) {
      try {
        const response = await apiCall("/api/Auth/forgot-password", "POST", {
          email,
        });
        console.log("Forgot password response:", response);

        return {
          success: true,
          message:
            response.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.",
        };
      } catch (error: any) {
        console.error("Forgot password error:", error);

        // Parse error message to provide better user feedback
        let errorMessage = "Failed to send reset email. Please try again.";

        if (error.message) {
          const msg = error.message.toLowerCase();

          if (msg.includes("404") || msg.includes("not found")) {
            errorMessage = "Email not found. Please check your email address.";
          } else if (
            msg.includes("400") ||
            msg.includes("bad request") ||
            msg.includes("invalid")
          ) {
            errorMessage =
              "Invalid email format. Please enter a valid email address.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (msg.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
          } else {
            errorMessage = error.message;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      // Mock forgot password
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: "Vui lòng kiểm tra email để đặt lại mật khẩu.",
          });
        }, 1000);
      });
    }
  },

  async getProfile(token: string): Promise<AuthResult> {
    if (USE_REAL_API) {
      try {
        const response = await apiCall("/api/Auth/me", "GET", null, token);
        console.log("Get profile response:", response);

        // Handle response format from real API
        return {
          success: true,
          data: {
            username: response.username || response.userName || "",
            name: response.name || response.fullName || response.username || "",
            email: response.email || "",
            role: response.role || "User",
            avatarUrl: response.avatarUrl || response.avatar || null,
            phoneNumber: response.phoneNumber || response.phone || null,
            districtName: response.districtName || response.district || null,
            wardId: response.wardId || null,
            wardName: response.wardName || response.ward || null,
          },
        };
      } catch (error: any) {
        console.error("Get profile error:", error);

        // Parse error message to provide better user feedback
        let errorMessage = "Failed to load profile. Please try again.";

        if (error.message) {
          const msg = error.message.toLowerCase();

          if (msg.includes("401") || msg.includes("unauthorized")) {
            errorMessage = "Session expired. Please login again.";
          } else if (msg.includes("403") || msg.includes("forbidden")) {
            errorMessage = "Access denied. Please check your permissions.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (msg.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
          } else {
            errorMessage = error.message;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      // Mock get profile
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              username: "user123",
              name: "Nguyen Van A",
              email: "user@example.com",
              role: "Operator",
              avatarUrl: null,
              phoneNumber: null,
              districtName: null,
              wardId: null,
              wardName: null,
            },
          });
        }, 500);
      });
    }
  },

  async updateProfile(
    profileData: {
      fullName?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      districtName?: string;
      wardId?: string;
      wardName?: string;
    },
    token: string,
  ): Promise<AuthResult> {
    if (USE_REAL_API) {
      try {
        const response = await apiCall(
          "/api/Auth/me",
          "PUT",
          profileData,
          token,
        );
        console.log("Update profile response:", response);

        // Return success result
        return {
          success: true,
          data: {
            username: response.username || response.userName || "",
            name:
              response.name || response.fullName || profileData.fullName || "",
            email: response.email || "",
            role: response.role || "User",
            avatarUrl: response.avatarUrl || profileData.avatarUrl || null,
            phoneNumber:
              response.phoneNumber || profileData.phoneNumber || null,
            districtName:
              response.districtName ||
              response.district ||
              profileData.districtName ||
              null,
            wardId: response.wardId || profileData.wardId || null,
            wardName:
              response.wardName ||
              response.ward ||
              profileData.wardName ||
              null,
          },
          message: response.message || "Profile updated successfully",
        };
      } catch (error: any) {
        console.error("Update profile error:", error);

        // Parse error message to provide better user feedback
        let errorMessage = "Failed to update profile. Please try again.";

        if (error.message) {
          const msg = error.message.toLowerCase();

          if (msg.includes("401") || msg.includes("unauthorized")) {
            errorMessage = "Session expired. Please login again.";
          } else if (msg.includes("403") || msg.includes("forbidden")) {
            errorMessage = "Access denied. Please check your permissions.";
          } else if (
            msg.includes("400") ||
            msg.includes("bad request") ||
            msg.includes("invalid")
          ) {
            errorMessage =
              "Invalid profile data. Please check your information.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (msg.includes("timeout")) {
            errorMessage = "Request timeout. Please try again.";
          } else {
            errorMessage = error.message;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } else {
      // Mock update profile
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              username: "user123",
              name: profileData.fullName || "Nguyen Van A",
              email: "user@example.com",
              role: "Operator",
              avatarUrl: profileData.avatarUrl || null,
              phoneNumber: profileData.phoneNumber || null,
              districtName: profileData.districtName || null,
              wardId: profileData.wardId || null,
              wardName: profileData.wardName || null,
            },
            message: "Profile updated successfully",
          });
        }, 1000);
      });
    }
  },
};
