import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  SelectChangeEvent,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Drawer,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import StyleIcon from '@mui/icons-material/Style';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import TableChartIcon from '@mui/icons-material/TableChart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import TitleSettingsDialog from './TitleSettingsDialog';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface StoredMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  messages: StoredMessage[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface ChatProps {
  onSignIn?: () => void;
}

interface StudioAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  beta?: boolean;
}

const DRAWER_WIDTH = 280;
const STUDIO_WIDTH = 320;

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

function generateChatTitleFallback(firstMessage: string): string {
  // Fallback: Take first 30 characters of the first message as title
  const title = firstMessage.slice(0, 30);
  return title.length < firstMessage.length ? `${title}...` : title;
}

function Chat({ onSignIn }: ChatProps) {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelError, setModelError] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats from storage on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { chats: savedChats } = await window.electronAPI.getAllChats();
        setChats(savedChats || []);
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };
    loadChats();
  }, []);

  // Generate chat title using AI with fallback
  const generateChatTitle = useCallback(async (firstMessage: string, model: string): Promise<string> => {
    try {
      const { title, error } = await window.electronAPI.generateTitle(firstMessage, model);
      if (error || !title) {
        console.log('AI title generation failed, using fallback:', error?.message);
        return generateChatTitleFallback(firstMessage);
      }
      return title;
    } catch (err) {
      console.error('Title generation error:', err);
      return generateChatTitleFallback(firstMessage);
    }
  }, []);

  // Save current chat when messages change
  const saveCurrentChat = useCallback(async (
    messagesToSave: Message[], 
    chatId: string | null, 
    model: string,
    isNewChat: boolean = false
  ) => {
    if (messagesToSave.length === 0) return null;

    const storedMessages: StoredMessage[] = messagesToSave.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      timestamp: m.timestamp.toISOString(),
    }));

    const now = new Date().toISOString();
    const firstUserMessage = messagesToSave.find((m) => m.role === 'user');
    
    // Only generate AI title for new chats, otherwise keep existing title
    let title = 'New Chat';
    if (firstUserMessage) {
      if (isNewChat) {
        // Generate AI title for new chats
        title = await generateChatTitle(firstUserMessage.content, model);
      } else if (chatId) {
        // Keep existing title for existing chats
        const existingChat = chats.find((c) => c.id === chatId);
        title = existingChat?.title || generateChatTitleFallback(firstUserMessage.content);
      } else {
        // Fallback for edge cases
        title = generateChatTitleFallback(firstUserMessage.content);
      }
    }

    const chat: Chat = {
      id: chatId || Date.now().toString(),
      title,
      messages: storedMessages,
      model,
      createdAt: chatId ? (chats.find((c) => c.id === chatId)?.createdAt || now) : now,
      updatedAt: now,
    };

    try {
      await window.electronAPI.saveChat(chat);
      
      // Update local chats state
      setChats((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === chat.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = chat;
          return updated;
        }
        return [chat, ...prev];
      });

      return chat.id;
    } catch (error) {
      console.error('Failed to save chat:', error);
      return null;
    }
  }, [chats, generateChatTitle]);

  const fetchModels = async () => {
    setLoadingModels(true);
    setModelError('');
    try {
      const { models: fetchedModels, error } = await window.electronAPI.getOllamaModels();
      if (error) {
        setModelError(error.message);
      } else {
        setModels(fetchedModels);
        if (fetchedModels.length > 0 && !selectedModel) {
          setSelectedModel(fetchedModels[0].name);
        }
      }
    } catch {
      setModelError('Failed to connect to Ollama');
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedModel) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Determine if this is a new chat (no currentChatId means new chat)
    const isNewChat = !currentChatId;

    // Save chat with user message first (generate AI title for new chats)
    const chatId = await saveCurrentChat(updatedMessages, currentChatId, selectedModel, isNewChat);
    if (chatId && !currentChatId) {
      setCurrentChatId(chatId);
    }

    try {
      const ollamaMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { response, error } = await window.electronAPI.chatWithOllama(
        selectedModel,
        ollamaMessages
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error ? `Error: ${error.message}` : response || 'No response',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save chat with assistant response (not a new chat anymore, keep existing title)
      await saveCurrentChat(finalMessages, chatId || currentChatId, selectedModel, false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      await saveCurrentChat(finalMessages, chatId || currentChatId, selectedModel, false);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setCurrentChatId(null);
  };

  const handleSelectChat = (chat: Chat) => {
    // Convert stored messages to Message format
    const loadedMessages: Message[] = chat.messages.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      timestamp: new Date(m.timestamp),
    }));
    setMessages(loadedMessages);
    setCurrentChatId(chat.id);
    if (chat.model && models.some((m) => m.name === chat.model)) {
      setSelectedModel(chat.model);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electronAPI.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Studio action handlers - dummy for now
  const handleStudioAction = (actionId: string, actionLabel: string) => {
    console.log(`Studio Action: ${actionId} - ${actionLabel}`);
  };

  // Studio actions configuration
  const studioActions: StudioAction[] = [
    { id: 'audio', label: 'Audio Overview', icon: <GraphicEqIcon />, color: '#1a73e8', bgColor: '#e8f0fe' },
    { id: 'video', label: 'Video Overview', icon: <VideocamIcon />, color: '#ea8600', bgColor: '#fef7e0' },
    { id: 'mindmap', label: 'Mind Map', icon: <AccountTreeIcon />, color: '#1a73e8', bgColor: '#e8f0fe' },
    { id: 'reports', label: 'Reports', icon: <DescriptionIcon />, color: '#5f6368', bgColor: '#f1f3f4' },
    { id: 'flashcards', label: 'Flashcards', icon: <StyleIcon />, color: '#e37400', bgColor: '#fef7e0' },
    { id: 'quiz', label: 'Quiz', icon: <QuizIcon />, color: '#1e8e3e', bgColor: '#e6f4ea' },
    { id: 'infographic', label: 'Infographic', icon: <BarChartIcon />, color: '#9334e6', bgColor: '#f3e8fd', beta: true },
    { id: 'slidedeck', label: 'Slide Deck', icon: <SlideshowIcon />, color: '#ea8600', bgColor: '#fef7e0', beta: true },
    { id: 'datatable', label: 'Data Table', icon: <TableChartIcon />, color: '#1a73e8', bgColor: '#e8f0fe' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{
            borderColor: 'primary.light',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
            },
          }}
        >
          New Chat
        </Button>
      </Box>

      {/* Chat List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1 }}>
          {chats.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No chats yet
              </Typography>
            </Box>
          ) : (
            chats.map((chat) => (
              <ListItemButton
                key={chat.id}
                selected={currentChatId === chat.id}
                onClick={() => handleSelectChat(chat)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    '&:hover': { bgcolor: 'primary.100' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ChatIcon fontSize="small" color={currentChatId === chat.id ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={chat.title}
                  secondary={new Date(chat.updatedAt).toLocaleDateString()}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.875rem',
                    fontWeight: currentChatId === chat.id ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  sx={{
                    opacity: 0,
                    '.MuiListItemButton-root:hover &': { opacity: 1 },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Chat Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin 0.3s',
          marginLeft: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)} size="small">
            <MenuIcon />
          </IconButton>
          
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 36, height: 36 }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              ByChat
            </Typography>
            {user && (
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            )}
          </Box>

          {/* Model Selector */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={selectedModel}
              label="Model"
              onChange={handleModelChange}
              disabled={loadingModels || models.length === 0}
            >
              {models.map((model) => (
                <MenuItem key={model.name} value={model.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {model.name}
                    <Chip
                      label={formatBytes(model.size)}
                      size="small"
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={fetchModels} disabled={loadingModels} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>

          <IconButton 
            onClick={() => setSettingsOpen(true)} 
            size="small"
            title="Title Generation Settings"
          >
            <SettingsIcon fontSize="small" />
          </IconButton>

          {user ? (
            <Button
              startIcon={<LogoutIcon />}
              onClick={logout}
              color="inherit"
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              startIcon={<LoginIcon />}
              onClick={onSignIn}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'primary.light' }}
            >
              Sign In
            </Button>
          )}
        </Box>

        {/* Model Error */}
        {modelError && (
          <Box sx={{ px: 3, py: 1, bgcolor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
            <Typography variant="body2" color="error">
              {modelError} - Make sure Ollama is running (ollama serve)
            </Typography>
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, bgcolor: '#f8fafc' }}>
          {messages.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                  mb: 2,
                }}
              >
                <SmartToyIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom color="text.primary">
                Start a conversation
              </Typography>
              <Typography color="text.secondary" textAlign="center" maxWidth={400}>
                {models.length > 0
                  ? `Select a model and send a message to chat with ${selectedModel || 'Ollama'}`
                  : 'No models found. Make sure Ollama is running with at least one model pulled.'}
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, maxWidth: '80%' }}>
                  {message.role === 'assistant' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                      }}
                    >
                      <SmartToyIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 3,
                      border: message.role === 'assistant' ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <Box
                        sx={{
                          '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                          '& pre': {
                            bgcolor: '#1e293b',
                            color: '#e2e8f0',
                            p: 2,
                            borderRadius: 2,
                            overflow: 'auto',
                            fontSize: '0.875rem',
                          },
                          '& code': {
                            bgcolor: '#f1f5f9',
                            color: '#1e293b',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                          },
                          '& pre code': {
                            bgcolor: 'transparent',
                            color: 'inherit',
                            p: 0,
                          },
                          '& ul, & ol': { pl: 2, m: 0, mb: 1 },
                          '& li': { mb: 0.5 },
                          '& h1, & h2, & h3, & h4': { mt: 1, mb: 0.5 },
                          '& blockquote': {
                            borderLeft: '3px solid',
                            borderColor: 'primary.light',
                            pl: 2,
                            ml: 0,
                            color: 'text.secondary',
                          },
                        }}
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </Box>
                    ) : (
                      <Typography
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {message.content}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        color: message.role === 'user' ? 'inherit' : 'text.secondary',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Paper>
                  {message.role === 'user' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#e2e8f0',
                        color: '#64748b',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))
          )}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CircularProgress size={16} />
                  <Typography color="text.secondary">Thinking...</Typography>
                </Paper>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-end',
              bgcolor: '#f1f5f9',
              borderRadius: 3,
              p: 1,
              border: '1px solid',
              borderColor: '#e2e8f0',
            }}
          >
            <TextField
              fullWidth
              placeholder={
                selectedModel
                  ? `Message ${selectedModel}...`
                  : 'Select a model first...'
              }
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && selectedModel && !loading) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }
              }}
              variant="standard"
              size="small"
              autoComplete="off"
              disabled={!selectedModel || loading}
              multiline
              maxRows={4}
              InputProps={{
                disableUnderline: true,
                sx: { px: 1 },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!input.trim() || loading || !selectedModel}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Studio Panel */}
      <Box
        sx={{
          width: STUDIO_WIDTH,
          borderLeft: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Studio Header */}
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
          <Typography variant="subtitle1" fontWeight={600}>
            Studio
          </Typography>
          <IconButton size="small">
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Studio Actions Grid */}
        <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
            }}
          >
            {studioActions.map((action) => (
              <Paper
                key={action.id}
                onClick={() => handleStudioAction(action.id, action.label)}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: action.bgColor,
                  cursor: 'pointer',
                  position: 'relative',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: action.color,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ color: action.color, mb: 1 }}>
                    {action.icon}
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => { e.stopPropagation(); console.log(`Edit ${action.label}`); }}
                    sx={{ p: 0.5, opacity: 0.6, '&:hover': { opacity: 1 } }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Typography variant="body2" fontWeight={500} sx={{ color: '#202124' }}>
                  {action.label}
                </Typography>
                {action.beta && (
                  <Chip
                    label="BETA"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      height: 18,
                      fontSize: '0.6rem',
                      bgcolor: 'rgba(0,0,0,0.08)',
                      color: '#5f6368',
                    }}
                  />
                )}
              </Paper>
            ))}
          </Box>

          {/* Deep Dive Section */}
          <Divider sx={{ my: 2 }} />
          
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#f8f9fa',
              border: '1px solid #e8eaed',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GraphicEqIcon sx={{ color: '#1a73e8', fontSize: 20 }} />
              <Typography variant="body2" fontWeight={600}>
                The Math...
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Deep Dive · 3 sources · 17m ago
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => console.log('Interactive mode clicked')}
              sx={{
                borderRadius: 4,
                textTransform: 'none',
                borderColor: '#1a73e8',
                color: '#1a73e8',
              }}
            >
              Interactive
            </Button>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#f8f9fa',
              border: '1px solid #e8eaed',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SlideshowIcon sx={{ color: '#5f6368', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Measuring Data Uncertainty
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    3 sources
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => console.log('Add note clicked')}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  bgcolor: '#202124',
                  color: 'white',
                  '&:hover': { bgcolor: '#3c4043' },
                }}
              >
                Add note
              </Button>
            </Box>
          </Paper>

          {/* Audio Player Section */}
          <Box sx={{ mt: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                border: '1px solid #e8eaed',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  The Math Behind P...
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => console.log('Thumbs up')}>
                    <span style={{ fontSize: 14 }}>👍</span>
                  </IconButton>
                  <IconButton size="small" onClick={() => console.log('Thumbs down')}>
                    <span style={{ fontSize: 14 }}>👎</span>
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="small"
                  onClick={() => console.log('Play audio')}
                  sx={{ bgcolor: '#1a73e8', color: 'white', '&:hover': { bgcolor: '#1557b0' } }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Box sx={{ flexGrow: 1, height: 4, bgcolor: '#e8eaed', borderRadius: 2, position: 'relative' }}>
                  <Box sx={{ width: '90%', height: '100%', bgcolor: '#1a73e8', borderRadius: 2 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  13:54 / 15:05
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Studio Input */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#f1f3f4',
              borderRadius: 3,
              p: 1,
              border: '1px solid #e8eaed',
            }}
          >
            <TextField
              fullWidth
              placeholder="Start typing..."
              variant="standard"
              size="small"
              onChange={(e) => console.log('Studio input:', e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: { px: 1, fontSize: '0.875rem' },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              3 sources
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => console.log('Submit studio input')}
              sx={{ bgcolor: '#1a73e8', color: 'white', '&:hover': { bgcolor: '#1557b0' } }}
            >
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Title Settings Dialog */}
      <TitleSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        models={models}
        currentModel={selectedModel}
      />
    </Box>
  );
}

export default Chat;
