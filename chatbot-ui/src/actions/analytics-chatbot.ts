import type { IChatMessage } from 'src/types/chat';

import axios from 'axios';

// ----------------------------------------------------------------------

export type AnalyticsQuery = {
  message: string;
};

export type AnalyticsResponse = {
  response: string;
};

// ----------------------------------------------------------------------

export async function sendAnalyticsQuery(query: string): Promise<string> {
  try {
    const response = await axios.post<AnalyticsResponse>(
      '/api/chat',
      { message: query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for AI processing
      }
    );

    return response.data.response;
  } catch (error) {
    console.error('Analytics chatbot error:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
        throw new Error('Analytics service is not available. Please ensure the chatbot server is running.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error('Failed to get analytics response. Please try again.');
  }
}

// ----------------------------------------------------------------------

export function createAnalyticsMessage(content: string, isUser: boolean = false): IChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    body: content,
    contentType: 'text',
    attachments: [],
    createdAt: Date.now(),
    senderId: isUser ? 'user' : 'analytics-bot',
  };
}