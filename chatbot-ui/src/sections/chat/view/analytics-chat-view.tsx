'use client';

import type { IChatMessage } from 'src/types/chat';

import { useState, useCallback, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { sendAnalyticsQuery, createAnalyticsMessage, exportDataToPdf, type ExportRequest } from 'src/actions/analytics-chatbot';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function AnalyticsChatView() {
  console.log('AnalyticsChatView rendering with export functionality');

  const [messages, setMessages] = useState<IChatMessage[]>([
    createAnalyticsMessage('Hello! I can help you analyze your sales data. Try asking me about your top-selling products, sales trends, or revenue analytics. You can also export your data as PDF reports!', false),
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

  return (
    <DashboardContent maxWidth="lg">
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Analytics Chatbot</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:download-bold" />}
            onClick={handleOpenExportDialog}
            disabled={isLoading || isExporting}
          >
            Export Data
          </Button>
        </Box>

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
              onKeyDown={handleKeyPress}
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
              'Show me sales trends for this month',
              'Which platform performs better: Shopee or Lazada?',
              'What is my total revenue for Q2 2025?',
              'Show inventory analytics',
              'Which products have high refund rates?',
              'What are the main refund reasons?',
              'Show me slow-moving inventory',
              'Break down sales by product category',
              'Compare brand performance based on revenue or orders',
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
    </DashboardContent>
  );
}