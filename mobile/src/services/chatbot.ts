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
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();
  if (!bodyText) return null;
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

export type ChatbotDebugResponse = {
  context: string;
};

export type ChatbotMessageRequest = {
  message: string;
};

export type ChatbotMessageResponse = {
  reply: string;
};

export const chatbotService = {
  async debug(token?: string): Promise<ApiResponse<ChatbotDebugResponse>> {
    try {
      const data = await request<ChatbotDebugResponse>(
        "/api/Chatbot/debug",
        "GET",
        token,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async sendMessage(
    payload: ChatbotMessageRequest,
    token?: string,
  ): Promise<ApiResponse<ChatbotMessageResponse>> {
    try {
      const data = await request<ChatbotMessageResponse>(
        "/api/Chatbot/message",
        "POST",
        token,
        payload,
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

