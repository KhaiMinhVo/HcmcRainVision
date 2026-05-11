import type { AlertSubscription } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateSubscriptionPayload {
  wardId: string;
  thresholdProbability: number;
}

interface UpdateSubscriptionPayload {
  thresholdProbability: number;
  isEnabled: boolean;
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
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  token?: string,
  body?: unknown,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || `HTTP error! status: ${response.status}`);
  }

  return data as T;
};

export const subscriptionsService = {
  async getAll(token?: string): Promise<ApiResponse<AlertSubscription[]>> {
    try {
      const data = await request<AlertSubscription[]>(
        "/api/subscriptions",
        "GET",
        token,
      );
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async create(
    payload: CreateSubscriptionPayload,
    token?: string,
  ): Promise<ApiResponse<AlertSubscription>> {
    try {
      const data = await request<AlertSubscription>(
        "/api/subscriptions",
        "POST",
        token,
        payload,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async update(
    subscriptionId: string,
    payload: UpdateSubscriptionPayload,
    token?: string,
  ): Promise<ApiResponse<AlertSubscription>> {
    try {
      const data = await request<AlertSubscription>(
        `/api/subscriptions/${subscriptionId}`,
        "PUT",
        token,
        payload,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async remove(subscriptionId: string, token?: string): Promise<ApiResponse> {
    try {
      const data = await request<any>(
        `/api/subscriptions/${subscriptionId}`,
        "DELETE",
        token,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
