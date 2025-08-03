'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from '../../iconify';
import { useSettingsContext } from '../context/use-settings-context';

import type { SettingsDrawerProps } from '../types';

// ----------------------------------------------------------------------

// Typing Indicator Component
const TypingIndicator = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-start',
      mb: 2,
    }}
  >
    <Box
      sx={{
        maxWidth: '70%',
        px: 2,
        py: 1,
        borderRadius: 2,
        background: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'text.secondary',
            animation: 'typing 1.4s infinite ease-in-out',
            '&:nth-of-type(1)': {
              animationDelay: '0s',
            },
            '&:nth-of-type(2)': {
              animationDelay: '0.2s',
            },
            '&:nth-of-type(3)': {
              animationDelay: '0.4s',
            },
            '@keyframes typing': {
              '0%, 60%, 100%': {
                transform: 'translateY(0)',
                opacity: 0.4,
              },
              '30%': {
                transform: 'translateY(-10px)',
                opacity: 1,
              },
            },
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'text.secondary',
            animation: 'typing 1.4s infinite ease-in-out',
            '&:nth-of-type(1)': {
              animationDelay: '0s',
            },
            '&:nth-of-type(2)': {
              animationDelay: '0.2s',
            },
            '&:nth-of-type(3)': {
              animationDelay: '0.4s',
            },
            '@keyframes typing': {
              '0%, 60%, 100%': {
                transform: 'translateY(0)',
                opacity: 0.4,
              },
              '30%': {
                transform: 'translateY(-10px)',
                opacity: 1,
              },
            },
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'text.secondary',
            animation: 'typing 1.4s infinite ease-in-out',
            '&:nth-of-type(1)': {
              animationDelay: '0s',
            },
            '&:nth-of-type(2)': {
              animationDelay: '0.2s',
            },
            '&:nth-of-type(3)': {
              animationDelay: '0.4s',
            },
            '@keyframes typing': {
              '0%, 60%, 100%': {
                transform: 'translateY(0)',
                opacity: 0.4,
              },
              '30%': {
                transform: 'translateY(-10px)',
                opacity: 1,
              },
            },
          }}
        />
      </Box>
    </Box>
  </Box>
);

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export function SettingsDrawer({ sx, defaultSettings }: SettingsDrawerProps) {
  const settings = useSettingsContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Suggested messages
  const suggestedMessages = [
    'List danh sách item tồn kho lâu',
    'Export cho tôi dữ liệu doanh thu t7',
    'Kiểm tra kho item mới nhập và cho tôi danh sách các người mua quan tâm cao đến sản phẩm',
    // 'Cảm ơn bạn rất nhiều!',
    // 'Tôi có một câu hỏi',
    // 'Bạn có thể giải thích rõ hơn không?',
    // 'Tôi muốn tìm hiểu thêm',
    // 'Có thể hướng dẫn tôi không?',
  ];

  const { mode, setMode, systemMode } = useColorScheme();

  useEffect(() => {
    if (mode === 'system' && systemMode) {
      settings.setState({ colorScheme: systemMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, systemMode]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');

    // Show typing indicator
    setIsTyping(true);

    // TODO: Replace this with actual API call
    // Example API endpoints you can call:
    // - OpenAI API: https://api.openai.com/v1/chat/completions
    // - Your own backend: https://your-api.com/chat
    // - Third-party chatbot API: https://api.chatbot.com/respond

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          // Add any other data you need
          userId: 'user123',
          sessionId: 'session456',
        }),
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      const botResponse = data.response || `"${currentInput}" + response`;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('API call failed:', error);

      // Fallback response if API fails
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `"${currentInput}" + response (API unavailable)`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      // Hide typing indicator
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedMessageClick = async (message: string) => {
    // Don't fill the input, just send the message directly
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages([userMessage]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response with delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `"${message}" + response`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([userMessage, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        flexShrink: 0,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        Chat
      </Typography>

      <Tooltip title="Close">
        <IconButton
          onClick={settings.onCloseDrawer}
          sx={{
            bgcolor: 'grey.100',
            '&:hover': { bgcolor: 'grey.200' },
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderChatArea = () => (
    <Box
      ref={chatAreaRef}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        overflow: 'auto',
        scrollBehavior: 'smooth',
      }}
    >
      {messages.length === 0 ? (
        // Welcome Message
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Box>
            {/* Chat Bubble Icon */}
            <Box
              sx={{
                position: 'relative',
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
                  position: 'relative',
                }}
              >
                <Iconify
                  icon="solar:chat-round-dots-bold"
                  sx={{
                    fontSize: 40,
                    color: 'white',
                  }}
                />
              </Box>

              {/* Decorative shapes */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  opacity: 0.6,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  left: -15,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  opacity: 0.6,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: -20,
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  opacity: 0.6,
                  transform: 'rotate(45deg)',
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Good morning!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 3,
              }}
            >
              Write something awesome...
            </Typography>

            {/* Suggested Messages - Only show when no messages */}
            {messages.length === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                    fontWeight: 'medium',
                  }}
                >
                  Gợi ý tin nhắn:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestedMessages.map((message, index) => (
                    <Box
                      key={index}
                      onClick={() => handleSuggestedMessageClick(message)}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          background: 'secondary.main',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        // Messages
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: message.isUser
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'background.paper',
                  color: message.isUser ? 'white' : 'text.primary',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ whiteSpace: 'pre-line' }}
                >
                  {message.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}
        </Box>
      )}
    </Box>
  );

  const renderInputSection = () => (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        background: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '& fieldset': {
                borderColor: 'divider',
              },
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Iconify icon="solar:paperclip-bold" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Iconify icon="solar:camera-bold" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            sx={{
              color: inputText.trim() ? 'primary.main' : 'text.secondary',
            }}
          >
            <Iconify icon="solar:send-bold" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{
        sx: [
          (theme) => ({
            ...theme.mixins.paperStyles(theme, {
              color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
            }),
            width: 600,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ],
      }}
    >
      {renderHead()}
      {renderChatArea()}
      {renderInputSection()}
    </Drawer>
  );
}
