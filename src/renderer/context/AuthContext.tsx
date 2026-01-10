import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { session, error } = await window.electronAPI.getSession();
      if (session && !error) {
        setUser(session.user);
      }
    } catch (err) {
      console.error('Failed to check session:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { user: authUser, error } = await window.electronAPI.login(email, password);
      if (error) {
        return { error: error.message };
      }
      setUser(authUser);
      return { error: null };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      return { error: errorMessage };
    }
  };

  const signup = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { user: authUser, error } = await window.electronAPI.signup(email, password);
      if (error) {
        return { error: error.message };
      }
      setUser(authUser);
      return { error: null };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      return { error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await window.electronAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
