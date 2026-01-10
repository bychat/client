interface User {
  id: string;
  email?: string;
}

interface AuthError {
  message: string;
}

interface Session {
  user: User;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface ChatMessage {
  role: string;
  content: string;
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

export interface ElectronAPI {
  login: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signup: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
  getSession: () => Promise<{ session: Session | null; error: AuthError | null }>;
  getOllamaModels: () => Promise<{ models: OllamaModel[]; error: AuthError | null }>;
  chatWithOllama: (model: string, messages: ChatMessage[]) => Promise<{ response: string | null; error: AuthError | null }>;
  getStoredData: (key: string) => Promise<unknown>;
  setStoredData: (key: string, value: unknown) => Promise<void>;
  getAllChats: () => Promise<{ chats: Chat[]; error: AuthError | null }>;
  saveChat: (chat: Chat) => Promise<{ success: boolean; error: AuthError | null }>;
  deleteChat: (chatId: string) => Promise<{ success: boolean; error: AuthError | null }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
