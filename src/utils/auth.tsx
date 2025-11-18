import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: any;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  justSignedUp: boolean;
  clearJustSignedUp: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  justSignedUp: false,
  clearJustSignedUp: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profileData?.full_name || profileData?.username || 'User',
          username: profileData?.username,
          avatar_url: profileData?.avatar_url,
        });
        setAccessToken(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profileData?.full_name || profileData?.username || 'User',
          username: profileData?.username,
          avatar_url: profileData?.avatar_url,
        });
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🟢 auth.tsx: signIn called');
    
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - check Supabase URL configuration')), 10000)
      );
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      console.log('🟢 auth.tsx: Supabase response:', { data, error });
      
      if (error) {
        console.error('🔴 auth.tsx: signIn error:', error);
        throw new Error(error.message);
      }
      
      if (data.session) {
        console.log('🟢 auth.tsx: Session exists, fetching profile...');
        // Fetch user profile to get name
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', data.user.id)
          .single();
      
        if (profileError) {
          console.error('🟡 auth.tsx: Profile fetch error (non-fatal):', profileError);
        }
      
        console.log('🟢 auth.tsx: Setting user state...');
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: profileData?.full_name || profileData?.username || 'User',
          username: profileData?.username,
          avatar_url: profileData?.avatar_url,
        });
        setAccessToken(data.session.access_token);
        console.log('🟢 auth.tsx: signIn complete!');
      }
    } catch (err: any) {
      console.error('🔴 auth.tsx: signIn exception:', err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Call our backend signup endpoint
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-6eb09999/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    // Now sign in
    await signIn(email, password);
    setJustSignedUp(true);
  };

  const signOut = async () => {
    console.log('Auth: signOut called');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Auth: signOut error', error);
        toast.error('Sign out failed');
        throw error;
      }
      setUser(null);
      setAccessToken(null);
      toast.success('Signed out');
      console.log('Auth: signOut successful');
    } catch (err: any) {
      console.error('Auth: signOut exception', err);
      throw err;
    }
  };

  const clearJustSignedUp = () => {
    setJustSignedUp(false);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, signIn, signUp, signOut, loading, justSignedUp, clearJustSignedUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}