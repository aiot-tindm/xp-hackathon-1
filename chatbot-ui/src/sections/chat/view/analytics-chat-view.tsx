'use client';

import type { IChatMessage } from 'src/types/chat';

import { useState, useCallback, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { sendAnalyticsQuery, createAnalyticsMessage } from 'src/actions/analytics-chatbot';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function AnalyticsChatView() {
  const [messages, setMessages] = useState<IChatMessage[]>([
    createAnalyticsMessage('Xin chào! Tôi có thể giúp bạn phân tích dữ liệu bán hàng. Hãy hỏi tôi về sản phẩm bán chạy nhất, xu hướng bán hàng, hoặc phân tích doanh thu.', false),
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = createAnalyticsMessage(inputMessage, true);
    const currentInput = inputMessage;
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendAnalyticsQuery(currentInput);
      const botMessage = createAnalyticsMessage(response, false);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = createAnalyticsMessage(
        error instanceof Error ? error.message : 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.',
        false
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <DashboardContent maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4">Chatbot Phân Tích Dữ Liệu</Typography>

        <Card sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Scrollbar sx={{ flex: 1, p: 3 }}>
              <Stack spacing={2}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.senderId === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: message.senderId === 'user' ? 'primary.main' : 'grey.100',
                        color: message.senderId === 'user' ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.body}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Đang phân tích dữ liệu...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
              <div ref={messagesEndRef} />
            </Scrollbar>
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <InputBase
              fullWidth
              multiline
              maxRows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi tôi về dữ liệu bán hàng của bạn..."
              disabled={isLoading}
              endAdornment={
                <IconButton 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  color="primary"
                >
                  <Iconify icon="solar:arrow-right-linear" />
                </IconButton>
              }
              sx={{
                py: 1.5,
                px: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              }}
            />
          </Box>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Câu hỏi nhanh
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[
              'Top 5 sản phẩm bán chạy nhất là gì?',
              'Hiển thị xu hướng bán hàng theo tháng',
              'Khách hàng nào mua nhiều nhất?',
              'Tổng doanh thu của tôi là bao nhiêu?',
              'Phân tích tồn kho hiện tại',
              'So sánh doanh thu theo quý',
              'Thống kê đơn hàng hôm nay',
              'Danh sách sản phẩm sắp hết hàng',
              'Báo cáo lợi nhuận theo sản phẩm',
              'Xu hướng mua sắm của khách hàng',
            ].map((question) => (
              <Box
                key={question}
                component="button"
                onClick={() => setInputMessage(question)}
                disabled={isLoading}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.lighter',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                }}
              >
                <Typography variant="body2">{question}</Typography>
              </Box>
            ))}
          </Stack>
        </Card>

        {/* API Suggestions */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Gợi ý xử lý API
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                📊 API Báo cáo & Thống kê:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • GET /api/analytics/sales-report - Lấy báo cáo bán hàng theo thời gian
                <br />
                • GET /api/analytics/top-products - Danh sách sản phẩm bán chạy
                <br />
                • GET /api/analytics/revenue-trend - Xu hướng doanh thu theo tháng/quý
                <br />
                • GET /api/analytics/customer-insights - Phân tích hành vi khách hàng
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                📈 API Dữ liệu Real-time:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • GET /api/dashboard/today-stats - Thống kê ngày hôm nay
                <br />
                • GET /api/inventory/low-stock - Sản phẩm sắp hết hàng  
                <br />
                • GET /api/orders/recent - Đơn hàng mới nhất
                <br />
                • WebSocket /ws/live-updates - Cập nhật dữ liệu trực tiếp
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                🔧 API Tùy chỉnh & Export:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • POST /api/reports/generate - Tạo báo cáo tùy chỉnh
                <br />
                • GET /api/export/excel - Xuất dữ liệu Excel
                <br />
                • GET /api/export/pdf - Xuất báo cáo PDF
                <br />
                • POST /api/alerts/setup - Thiết lập cảnh báo tự động
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}