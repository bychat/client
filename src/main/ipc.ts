import { IpcMain } from 'electron';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Store from 'electron-store';

// Initialize store for persistent data
const store = new Store();

// Title generation settings interface
interface TitleGenerationSettings {
  enabled: boolean;
  model: string; // Model to use for title generation (empty = use chat model)
  prompt: string; // Custom prompt for title generation
}

const DEFAULT_TITLE_PROMPT = `Generate a short, concise title (max 6 words) for this conversation based on the first message. Only respond with the title, no quotes or extra text.

First message: {message}`;

const DEFAULT_TITLE_SETTINGS: TitleGenerationSettings = {
  enabled: true,
  model: '', // Empty means use the currently selected chat model
  prompt: DEFAULT_TITLE_PROMPT,
};

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    // Read env vars lazily (after dotenv has loaded)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key are required. Check your .env file.');
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabase;
}

export function setupIpcHandlers(ipcMain: IpcMain): void {
  // Auth handlers
  ipcMain.handle('auth:login', async (_, email: string, password: string) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { user: null, error: { message: error.message } };
      }
      
      // Store session
      if (data.session) {
        store.set('session', data.session);
      }
      
      return { user: data.user, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { user: null, error: { message } };
    }
  });

  ipcMain.handle('auth:signup', async (_, email: string, password: string) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { user: null, error: { message: error.message } };
      }
      
      return { user: data.user, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { user: null, error: { message } };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.signOut();
      store.delete('session');
      
      if (error) {
        return { error: { message: error.message } };
      }
      
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      return { error: { message } };
    }
  });

  ipcMain.handle('auth:getSession', async () => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.getSession();
      
      if (error) {
        return { session: null, error: { message: error.message } };
      }
      
      return { session: data.session, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get session';
      return { session: null, error: { message } };
    }
  });

  // Chat handlers
  ipcMain.handle('chat:sendMessage', async (_, message: string) => {
    try {
      const client = getSupabaseClient();
      const { data: sessionData } = await client.auth.getSession();
      
      if (!sessionData.session) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      // Send message to backend API
      const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiBaseUrl}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json() as { message?: string };
      
      if (!response.ok) {
        return { data: null, error: { message: data.message || 'Failed to send message' } };
      }
      
      return { data, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      return { data: null, error: { message } };
    }
  });

  // Ollama handlers - use 127.0.0.1 instead of localhost for better compatibility
  const OLLAMA_BASE_URL = 'http://127.0.0.1:11434/api';

  interface OllamaModelResponse {
    name: string;
    size: number;
    modified_at: string;
    remote_host?: string; // Cloud models have this field
  }

  ipcMain.handle('ollama:listModels', async () => {
    try {
      console.log('Fetching Ollama models from:', `${OLLAMA_BASE_URL}/tags`);
      const response = await fetch(`${OLLAMA_BASE_URL}/tags`);
      if (!response.ok) {
        console.error('Ollama response not ok:', response.status);
        return { models: [], error: { message: `Failed to fetch models (${response.status})` } };
      }
      const data = await response.json() as { models: OllamaModelResponse[] };
      
      // Show all models (including cloud) for testing
      // To filter only local: const localModels = (data.models || []).filter(model => !model.remote_host);
      const allModels = data.models || [];
      console.log('Ollama models:', allModels.length);
      
      return { models: allModels, error: null };
    } catch (err: unknown) {
      console.error('Ollama fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to connect to Ollama';
      return { models: [], error: { message } };
    }
  });

  ipcMain.handle('ollama:chat', async (_, model: string, messages: Array<{ role: string; content: string }>) => {
    try {
      console.log('Sending chat to Ollama, model:', model);
      const response = await fetch(`${OLLAMA_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Ollama chat error:', errorData);
        return { response: null, error: { message: errorData || 'Failed to get response from Ollama' } };
      }

      const data = await response.json() as { message: { role: string; content: string } };
      console.log('Ollama response received');
      return { response: data.message.content, error: null };
    } catch (err: unknown) {
      console.error('Ollama chat fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to chat with Ollama';
      return { response: null, error: { message } };
    }
  });

  // Storage handlers
  ipcMain.handle('storage:get', async (_, key: string) => {
    return store.get(key);
  });

  ipcMain.handle('storage:set', async (_, key: string, value: unknown) => {
    store.set(key, value);
  });

  // Chat history handlers
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

  ipcMain.handle('chats:getAll', async () => {
    try {
      const chats = store.get('chats', []) as Chat[];
      return { chats, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get chats';
      return { chats: [], error: { message } };
    }
  });

  ipcMain.handle('chats:save', async (_, chat: Chat) => {
    try {
      const chats = store.get('chats', []) as Chat[];
      const existingIndex = chats.findIndex((c: Chat) => c.id === chat.id);
      
      if (existingIndex >= 0) {
        chats[existingIndex] = chat;
      } else {
        chats.unshift(chat); // Add new chat at the beginning
      }
      
      store.set('chats', chats);
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save chat';
      return { success: false, error: { message } };
    }
  });

  ipcMain.handle('chats:delete', async (_, chatId: string) => {
    try {
      const chats = store.get('chats', []) as Chat[];
      const filteredChats = chats.filter((c: Chat) => c.id !== chatId);
      store.set('chats', filteredChats);
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete chat';
      return { success: false, error: { message } };
    }
  });

  // Title generation settings handlers
  ipcMain.handle('titleSettings:get', async () => {
    try {
      const settings = store.get('titleSettings') as TitleGenerationSettings | undefined;
      return { settings: settings || DEFAULT_TITLE_SETTINGS, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get title settings';
      return { settings: DEFAULT_TITLE_SETTINGS, error: { message } };
    }
  });

  ipcMain.handle('titleSettings:set', async (_, newSettings: TitleGenerationSettings) => {
    try {
      store.set('titleSettings', newSettings);
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save title settings';
      return { success: false, error: { message } };
    }
  });

  ipcMain.handle('title:generate', async (_, message: string, chatModel: string) => {
    try {
      // Get title generation settings
      const settings = store.get('titleSettings') as TitleGenerationSettings | undefined;
      const { enabled, model, prompt } = settings || DEFAULT_TITLE_SETTINGS;
      
      if (!enabled) {
        return { title: null, error: { message: 'Title generation is disabled' } };
      }

      // Use title model if specified, otherwise use the current chat model
      const titleModel = model || chatModel;
      
      if (!titleModel) {
        return { title: null, error: { message: 'No model available for title generation' } };
      }

      // Use default prompt if none provided
      const finalPrompt = prompt.trim() || DEFAULT_TITLE_PROMPT;
      const fullPrompt = finalPrompt.replace('{message}', message);

      console.log('Generating title with model:', titleModel);

      // Generate title using Ollama
      const response = await fetch(`${OLLAMA_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: titleModel,
          messages: [{ role: 'user', content: fullPrompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Title generation error:', errorData);
        return { title: null, error: { message: 'Failed to generate title with Ollama' } };
      }

      const data = await response.json() as { message: { role: string; content: string } };
      // Clean up the title - remove quotes, trim, and limit length
      let generatedTitle = data.message.content.trim();
      generatedTitle = generatedTitle.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      generatedTitle = generatedTitle.slice(0, 50); // Limit to 50 chars
      
      console.log('Generated title:', generatedTitle);
      
      return { title: generatedTitle, error: null };
    } catch (err: unknown) {
      console.error('Title generation error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate title';
      return { title: null, error: { message } };
    }
  });

  // Get default title prompt
  ipcMain.handle('title:getDefaultPrompt', async () => {
    return { prompt: DEFAULT_TITLE_PROMPT };
  });
}
