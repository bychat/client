import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, SelectChangeEvent } from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import StyleIcon from '@mui/icons-material/Style';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useAuth } from '../context/AuthContext';
import ChatHeader from './chat/ChatHeader';
import ChatSidebar from './chat/ChatSidebar';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import StudioPanel from './chat/StudioPanel';
import ModelSelector from './common/ModelSelector';
import EmptyState from './common/EmptyState';
import SettingsDialog from './SettingsDialog';

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

function generateChatTitleFallback(firstMessage: string): string {
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
    
    let title = 'New Chat';
    if (firstUserMessage) {
      if (isNewChat) {
        title = await generateChatTitle(firstUserMessage.content, model);
      } else if (chatId) {
        const existingChat = chats.find((c) => c.id === chatId);
        title = existingChat?.title || generateChatTitleFallback(firstUserMessage.content);
      } else {
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

    const isNewChat = !currentChatId;
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

  const handleDeleteChat = async (chatId: string) => {
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

  const handleStudioAction = (actionId: string, actionLabel: string) => {
    console.log(`Studio Action: ${actionId} - ${actionLabel}`);
  };

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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <ChatHeader
        userEmail={user?.email}
        onMenuClick={() => setDrawerOpen(true)}
        onNewChat={handleNewChat}
        onSettingsClick={() => setSettingsOpen(true)}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Chat Sidebar Drawer */}
        <ChatSidebar
          open={drawerOpen}
          chats={chats}
          currentChatId={currentChatId}
          drawerWidth={DRAWER_WIDTH}
          onClose={() => setDrawerOpen(false)}
          onChatSelect={handleSelectChat}
          onChatDelete={handleDeleteChat}
        />

        {/* Chat Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          {/* Model Selector */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              loading={loadingModels}
              error={modelError}
              onModelChange={handleModelChange}
              onRefresh={fetchModels}
            />
          </Box>

          {/* Messages Area */}
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <MessageList messages={messages} messagesEndRef={messagesEndRef} />
          )}

          {/* Input Area */}
          <ChatInput
            input={input}
            loading={loading}
            disabled={!selectedModel}
            onInputChange={setInput}
            onSubmit={handleSubmit}
          />
        </Box>

        {/* Studio Panel */}
        <StudioPanel
          studioWidth={STUDIO_WIDTH}
          studioActions={studioActions}
          onActionClick={handleStudioAction}
        />
      </Box>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        models={models}
        currentModel={selectedModel}
      />
    </Box>
  );
}

export default Chat;
