import { apiPost } from './apiClient';

export interface ChatbotMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export async function sendChatMessage(message: string): Promise<string> {
  const res = await apiPost<{ reply: string }>('api/chatbot/message', { message });
  return res.reply;
}
