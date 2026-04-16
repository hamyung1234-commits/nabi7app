import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../lib/supabase';

interface User {
  id: string;
  email?: string;
  created_at?: string;
  email_confirmed_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have valid Supabase credentials (not placeholders)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Check if credentials are valid (not empty, not placeholder)
    const hasValidCredentials = 
      supabaseUrl && supabaseKey && 
      supabaseUrl !== '' && supabaseKey !== '' &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseKey.includes('placeholder');

    if (!hasValidCredentials) {
      console.log('[AuthContext] No valid Supabase credentials - using local storage only');
      setLoading(false);
      return;
    }

    // Valid credentials found - attempt to get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user as User | null);
      setLoading(false);
    }).catch((error) => {
      console.warn('[AuthContext] Failed to get user:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user as User | null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const hasValidCredentials = 
      supabaseUrl && supabaseKey && 
      supabaseUrl !== '' && supabaseKey !== '' &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseKey.includes('placeholder');
    
    if (hasValidCredentials) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default value if AuthContext is not available
    return {
      user: null,
      loading: false,
      signOut: async () => {}
    };
  }
  return context;
}
