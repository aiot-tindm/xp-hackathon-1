'use client';

import type { IChatMessage } from 'src/types/chat';

import { useState, useCallback, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { sendAnalyticsQuery, createAnalyticsMessage, exportDataToPdf, type ExportRequest } from 'src/actions/analytics-chatbot';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<IChatMessage[]>([
    createAnalyticsMessage('Hello! I can help you analyze your sales data. Try asking me about your top-selling products, sales trends, or revenue analytics. Click the export button to generate PDF reports!', false),
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    type: 'best_seller',
    format: 'pdf',
    language: 'vi',
    limit: 10,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleOpenExportDialog = useCallback(() => {
    setIsExportDialogOpen(true);
  }, []);

  const handleCloseExportDialog = useCallback(() => {
    setIsExportDialogOpen(false);
  }, []);

  const handleExportRequestChange = useCallback((field: keyof ExportRequest, value: any) => {
    setExportRequest(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportDataToPdf(exportRequest);
      const successMessage = createAnalyticsMessage(
        `✅ Successfully exported ${exportRequest.type} report as PDF! The file should start downloading shortly.`,
        false
      );
      setMessages(prev => [...prev, successMessage]);
      setIsExportDialogOpen(false);
    } catch (error) {
      const errorMessage = createAnalyticsMessage(
        `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        false
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsExporting(false);
    }
  }, [exportRequest]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputMessage(question);
  }, []);

  return (
    <>
      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 400,
            height: 600,
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Iconify icon="solar:chat-round-call-bold" width={18} />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                Analytics AI
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={handleOpenExportDialog}
                disabled={isLoading || isExporting}
                title="Export to PDF"
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                  '&:disabled': {
                    color: 'rgba(255,255,255,0.5)',
                  }
                }}
              >
                <Iconify icon="solar:download-bold" width={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleToggleChat}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <Iconify icon="solar:close-circle-bold" width={16} />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <Box sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              maxHeight: '100%',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.4)',
                },
              },
            }}>
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
                        maxWidth: '80%',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: message.senderId === 'user' ? 'primary.main' : 'grey.100',
                        color: message.senderId === 'user' ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                        {message.body}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={12} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        Analyzing...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
              <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Quick Questions */}
          <Box sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
            flexShrink: 0
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Quick questions:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {[
                'Top products?',
                'Sales trends?',
                'Revenue Q2?',
                'Refund rates?',
              ].map((question) => (
                <Button
                  key={question}
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                  sx={{
                    fontSize: '0.7rem',
                    py: 0.5,
                    px: 1,
                    minWidth: 'auto',
                    borderRadius: 3,
                  }}
                >
                  {question}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Input */}
          <Box sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            flexShrink: 0,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2
          }}>
            <InputBase
              fullWidth
              multiline
              maxRows={3}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data..."
              disabled={isLoading}
              endAdornment={
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  color="primary"
                  size="small"
                >
                  <Iconify icon="solar:arrow-right-linear" width={16} />
                </IconButton>
              }
              sx={{
                py: 1,
                px: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                },
              }}
            />
          </Box>
        </Paper>
      </Collapse>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={handleToggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1300,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        }}
      >
        <Iconify
          icon={isOpen ? "solar:close-circle-bold" : "solar:chat-round-call-bold"}
          width={24}
        />
      </Fab>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Export Data to PDF</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Report Type
              </Typography>
              <Select
                value={exportRequest.type}
                onChange={(e) => handleExportRequestChange('type', e.target.value)}
                fullWidth
              >
                <MenuItem value="best_seller">Best Selling Products</MenuItem>
                <MenuItem value="revenue">Revenue Analysis</MenuItem>
                <MenuItem value="refund">Refund Analysis</MenuItem>
                <MenuItem value="refund_reason">Refund Reasons</MenuItem>
                <MenuItem value="category">Category Analysis</MenuItem>
                <MenuItem value="brand">Brand Analysis</MenuItem>
                <MenuItem value="slow_moving">Slow Moving Inventory</MenuItem>
                <MenuItem value="all">All Reports Combined</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Platform (Optional)
                </Typography>
                <Select
                  value={exportRequest.platform || ''}
                  onChange={(e) => handleExportRequestChange('platform', e.target.value || undefined)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">All Platforms</MenuItem>
                  <MenuItem value="Shopee">Shopee</MenuItem>
                  <MenuItem value="Lazada">Lazada</MenuItem>
                  <MenuItem value="TikTok">TikTok</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Limit
                </Typography>
                <TextField
                  type="number"
                  value={exportRequest.limit}
                  onChange={(e) => handleExportRequestChange('limit', parseInt(e.target.value) || 10)}
                  slotProps={{ htmlInput: { min: 1, max: 100 } }}
                  fullWidth
                />
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Month (Optional)
                </Typography>
                <Select
                  value={exportRequest.month || ''}
                  onChange={(e) => handleExportRequestChange('month', e.target.value || undefined)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">All Months</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Year
                </Typography>
                <TextField
                  type="number"
                  value={exportRequest.year || new Date().getFullYear()}
                  onChange={(e) => handleExportRequestChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                  slotProps={{ htmlInput: { min: 2020, max: 2030 } }}
                  fullWidth
                />
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quarter (Optional)
              </Typography>
              <Select
                value={exportRequest.quarter || ''}
                onChange={(e) => handleExportRequestChange('quarter', e.target.value || undefined)}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">All Quarters</MenuItem>
                <MenuItem value="Q1">Q1 (Jan-Mar)</MenuItem>
                <MenuItem value="Q2">Q2 (Apr-Jun)</MenuItem>
                <MenuItem value="Q3">Q3 (Jul-Sep)</MenuItem>
                <MenuItem value="Q4">Q4 (Oct-Dec)</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Language
                </Typography>
                <Select
                  value={exportRequest.language}
                  onChange={(e) => handleExportRequestChange('language', e.target.value)}
                  fullWidth
                >
                  <MenuItem value="vi">Vietnamese</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Include Refund Data
                </Typography>
                <Select
                  value={exportRequest.include_refund ? 'yes' : 'no'}
                  onChange={(e) => handleExportRequestChange('include_refund', e.target.value === 'yes')}
                  fullWidth
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExportDialog} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={16} /> : <Iconify icon="solar:download-bold" />}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}