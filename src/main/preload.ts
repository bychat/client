import { contextBridge, ipcRenderer } from 'electron';

// Chat types
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  login: (email: string, password: string) => 
    ipcRenderer.invoke('auth:login', email, password),
  signup: (email: string, password: string) => 
    ipcRenderer.invoke('auth:signup', email, password),
  logout: () => 
    ipcRenderer.invoke('auth:logout'),
  getSession: () => 
    ipcRenderer.invoke('auth:getSession'),
  
  // Ollama
  getOllamaModels: () => 
    ipcRenderer.invoke('ollama:listModels'),
  chatWithOllama: (model: string, messages: Array<{ role: string; content: string }>) => 
    ipcRenderer.invoke('ollama:chat', model, messages),
  
  // Storage
  getStoredData: (key: string) => 
    ipcRenderer.invoke('storage:get', key),
  setStoredData: (key: string, value: unknown) => 
    ipcRenderer.invoke('storage:set', key, value),
  
  // Chat history
  getAllChats: () => 
    ipcRenderer.invoke('chats:getAll'),
  saveChat: (chat: Chat) => 
    ipcRenderer.invoke('chats:save', chat),
  deleteChat: (chatId: string) => 
    ipcRenderer.invoke('chats:delete', chatId),
});
