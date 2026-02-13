import { Drawer, Box, List, ListItemButton, ListItemText, ListItemIcon, IconButton, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

interface Chat {
  id: string;
  title: string;
  messages: unknown[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  open: boolean;
  chats: Chat[];
  currentChatId: string | null;
  drawerWidth: number;
  onClose: () => void;
  onChatSelect: (chat: Chat) => void;
  onChatDelete: (chatId: string) => void;
}

export default function ChatSidebar({
  open,
  chats,
  currentChatId,
  drawerWidth,
  onClose,
  onChatSelect,
  onChatDelete,
}: ChatSidebarProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Chat History
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Chat List */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
          {chats.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No chats yet. Start a new conversation!
              </Typography>
            </Box>
          ) : (
            chats.map((chat) => (
              <ListItemButton
                key={chat.id}
                selected={chat.id === currentChatId}
                onClick={() => {
                  onChatSelect(chat);
                  onClose();
                }}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ChatIcon fontSize="small" color={chat.id === currentChatId ? 'primary' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={chat.title}
                  secondary={`${chat.messages.length} messages`}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontWeight: chat.id === currentChatId ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatDelete(chat.id);
                  }}
                  sx={{ opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))
          )}
        </List>
      </Box>
    </Drawer>
  );
}
