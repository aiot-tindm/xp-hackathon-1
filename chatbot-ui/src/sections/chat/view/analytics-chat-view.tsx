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
    createAnalyticsMessage('Hello! I can help you analyze your sales data. Try asking me about your top-selling products, sales trends, or revenue analytics.', false),
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
        error instanceof Error ? error.message : 'Sorry, I encountered an error processing your request.',
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
        <Typography variant="h4">Analytics Chatbot</Typography>

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
                        Analyzing your data...
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
              placeholder="Ask me about your sales data..."
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
            Quick Questions
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[
              'What are my top 5 selling products?',
              'Show me sales trends',
              'Which customers buy the most?',
              'What is my total revenue?',
              'Show inventory analytics',
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
      </Stack>
    </DashboardContent>
  );
}