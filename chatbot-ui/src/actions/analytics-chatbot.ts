import type { IChatMessage } from 'src/types/chat';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type AnalyticsQuery = {
  message: string;
};

export type AnalyticsResponse = {
  response: string;
};

// ----------------------------------------------------------------------

export type ExportRequest = {
  type:
    | 'best_seller'
    | 'refund'
    | 'refund_reason'
    | 'revenue'
    | 'category'
    | 'brand'
    | 'slow_moving'
    | 'all';
  platform?: string;
  month?: string;
  year?: number;
  quarter?: string;
  include_refund?: boolean;
  limit?: number;
  format?: 'pdf' | 'excel' | 'csv';
  language?: 'vi' | 'en';
};

export async function exportDataToPdf(request: ExportRequest): Promise<void> {
  try {
    const exportUrl = CONFIG.api.exportPdfBaseUrl
      ? CONFIG.api.exportPdfBaseUrl + '/api/export/direct'
      : '/export-pdf/api/export/direct';
    const response = await axios.post(exportUrl, request, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
      timeout: 120000, // 2 minute timeout for PDF processing
    });

    // Create blob URL for PDF download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${request.type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export PDF error:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
        throw new Error(
          'Export service is not available. Please ensure the export-pdf server is running.'
        );
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error('Failed to export PDF. Please try again.');
  }
}

export async function sendAnalyticsQuery(
  query: string,
  abortController?: AbortController
): Promise<string> {
  try {
    const chatUrl = CONFIG.api.chatbotBaseUrl
      ? CONFIG.api.chatbotBaseUrl + '/api/chat'
      : '/chatbot//api/chat';
    const response = await axios.post<AnalyticsResponse>(
      chatUrl,
      { message: query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 240000, // 60 second timeout for AI processing
        signal: abortController?.signal,
      }
    );

    return response.data.response;
  } catch (error) {
    console.error('Analytics chatbot error:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
        throw new Error(
          'Analytics service is not available. Please ensure the chatbot server is running.'
        );
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
