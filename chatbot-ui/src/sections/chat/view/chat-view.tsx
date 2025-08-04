'use client';

import type { IChatParticipant } from 'src/types/chat';

import { useState, useEffect, useCallback, startTransition } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetContacts, useGetConversation, useGetConversations } from 'src/actions/chat';

import { EmptyContent } from 'src/components/empty-content';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useMockedUser } from 'src/auth/hooks';

import { ChatNav } from '../chat-nav';
import { ChatLayout } from '../layout';
import { ChatRoom } from '../chat-room';
import { ChatMessageList } from '../chat-message-list';
import { ChatMessageInput } from '../chat-message-input';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatHeaderCompose } from '../chat-header-compose';
import { useCollapseNav } from '../hooks/use-collapse-nav';

// ----------------------------------------------------------------------

export function ChatView() {
  const router = useRouter();

  const { user } = useMockedUser();

  const { contacts } = useGetContacts();

  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('id') || '';

  const { conversations, conversationsLoading } = useGetConversations();
  const { conversation, conversationError, conversationLoading } =
    useGetConversation(selectedConversationId);

  const roomNav = useCollapseNav();
  const conversationsNav = useCollapseNav();

  const [recipients, setRecipients] = useState<IChatParticipant[]>([]);

  useEffect(() => {
    if (!selectedConversationId) {
      startTransition(() => {
        router.push(paths.dashboard.chat);
      });
    }
  }, [conversationError, router, selectedConversationId]);

  const handleAddRecipients = useCallback((selected: IChatParticipant[]) => {
    setRecipients(selected);
  }, []);

  const filteredParticipants: IChatParticipant[] = conversation
    ? conversation.participants.filter(
        (participant: IChatParticipant) => participant.id !== `${user?.id}`
      )
    : [];

  const hasConversation = selectedConversationId && conversation;

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      {/* <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Chat
      </Typography> */}

      <ChatLayout
        slots={{
          header: hasConversation ? (
            <ChatHeaderDetail
              collapseNav={roomNav}
              participants={filteredParticipants}
              loading={conversationLoading}
            />
          ) : (
            <ChatHeaderCompose contacts={contacts} onAddRecipients={handleAddRecipients} />
          ),
          nav: (
            <ChatNav
              contacts={contacts}
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              collapseNav={conversationsNav}
              loading={conversationsLoading}
            />
          ),
          main: (
            <>
              {selectedConversationId ? (
                conversationError ? (
                  <EmptyContent
                    title={conversationError.message}
                    imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-chat-empty.svg`}
                  />
                ) : (
                  <ChatMessageList
                    messages={conversation?.messages ?? []}
                    participants={filteredParticipants}
                    loading={conversationLoading}
                  />
                )
              ) : (
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <EmptyContent
                    title="Chào buổi sáng!"
                    description="Hãy viết gì đó thật tuyệt vời..."
                    imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-chat-active.svg`}
                  />
                  
                  {/* Quick Suggestions */}
                  <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto', width: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                      Gợi ý tin nhắn nhanh
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        'Xin chào! Bạn khỏe không?',
                        'Hôm nay công việc thế nào?',
                        'Có tin gì mới không?',
                        'Chúng ta hẹn gặp nhau nhé!',
                        'Cảm ơn bạn rất nhiều!',
                      ].map((suggestion, index) => (
                        <Box
                          key={index}
                          component="button"
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'background.paper',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'primary.lighter',
                            },
                          }}
                        >
                          <Typography variant="body2">{suggestion}</Typography>
                        </Box>
                      ))}
                    </Stack>

                    {/* API Integration Suggestions */}
                    <Card sx={{ mt: 4, p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        🔧 Gợi ý tích hợp API
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            💬 Chat API Endpoints:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • POST /api/chat/send - Gửi tin nhắn
                            <br />
                            • GET /api/chat/conversations - Lấy danh sách cuộc trò chuyện
                            <br />
                            • GET /api/chat/messages/:id - Lấy tin nhắn theo cuộc trò chuyện
                            <br />
                            • WebSocket /ws/chat - Nhận tin nhắn real-time
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            📁 File & Media API:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • POST /api/upload/image - Upload hình ảnh
                            <br />
                            • POST /api/upload/file - Upload file đính kèm
                            <br />
                            • GET /api/media/:id - Lấy file media
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            👥 User & Contact API:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • GET /api/users/contacts - Danh sách liên hệ
                            <br />
                            • POST /api/users/add-contact - Thêm liên hệ mới
                            <br />
                            • GET /api/users/online - Người dùng đang online
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Box>
                </Box>
              )}

              <ChatMessageInput
                recipients={recipients}
                onAddRecipients={handleAddRecipients}
                selectedConversationId={selectedConversationId}
                disabled={!recipients.length && !selectedConversationId}
              />
            </>
          ),
          details: hasConversation && (
            <ChatRoom
              collapseNav={roomNav}
              participants={filteredParticipants}
              loading={conversationLoading}
              messages={conversation?.messages ?? []}
            />
          ),
        }}
      />
    </DashboardContent>
  );
}
