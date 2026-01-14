import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from './supabase/info';

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; 
  refreshSession: () => Promise<void>;
  justSignedUp: boolean;
  clearJustSignedUp: () => void;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- supabase client ---------- */

const supabaseUrl = `https://${projectId}.supabase.co`;
console.log("🟠 auth.tsx: Supabase URL", supabaseUrl);

const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});
// Export the supabase client for use in other modules
export { supabase };

/* ---------- utility functions ---------- */

/**
 * Gets the display name from a user object
 * Priority: username > name (first name) > email prefix
 */
export function getUserDisplayName(user: any): string {
  if (!user) return 'User';

  // Prefer username first
  if (user.username) {
    return user.username;
  }

  // Then try name (first name only)
  if (user.name && typeof user.name === 'string') {
    return user.name.trim().split(/\s+/)[0];
  }

  // Fallback to email username (part before @)
  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'User';
}

/* ---------- provider ---------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [justSignedUp, setJustSignedUp] = useState(false);
  
  const lastPopulatedUserId = useRef<string | null>(null);

    // ...existing code...
  
    // Single populateUserFromSession function
        async function populateUserFromSession(session: Session) {
      try {
        const supaUser = session.user;
        
        if (lastPopulatedUserId.current === supaUser.id) {
          console.log("🟡 auth.tsx: Already populated user", supaUser.id);
          setAccessToken(session.access_token);
          return;
        }
        
        console.log("🟢 auth.tsx: populateUserFromSession", supaUser.id);
        setAccessToken(session.access_token);
        
        // Fetch username from profiles table instead of metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', supaUser.id)
          .single();
        
        const userData: UserProfile = {
          id: supaUser.id,
          email: supaUser.email || '',
          name: supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || null,
          username: profile?.username || supaUser.user_metadata?.username || null,
          avatar_url: profile?.avatar_url || supaUser.user_metadata?.avatar_url || null,
        };
        
        console.log("🟢 Setting user:", userData);
        setUser(userData);
        lastPopulatedUserId.current = supaUser.id;
        console.log("🟢 User set complete!");
      } catch (err) {
        console.error("🔴 auth.tsx: populateUserFromSession error", err);
        const userData: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          name: null,
          username: null,
          avatar_url: null,
        };
        setUser(userData);
        setAccessToken(session.access_token);
        lastPopulatedUserId.current = session.user.id;
      }
    }
  
  // ...existing code...

  // Load initial session
  useEffect(() => {
    console.log("🟠 auth.tsx: useEffect -> loadInitialSession");

    async function loadInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("🔴 auth.tsx: getSession error", error);
        }

        if (session?.user) {
          console.log("🟢 auth.tsx: Existing session found for user", session.user.id);
          await populateUserFromSession(session);
        } else {
          console.log("🟡 auth.tsx: No existing session");
        }
      } catch (err) {
        console.error("🔴 auth.tsx: loadInitialSession exception", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🟠 auth.tsx: onAuthStateChange", event, { hasSession: !!session });

      if (session?.user) {
        if (lastPopulatedUserId.current === session.user.id && user !== null) {
          console.log("🟡 auth.tsx: Skipping duplicate populate for", session.user.id);
          return;
        }
        await populateUserFromSession(session);
      } else {
        lastPopulatedUserId.current = null;
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ---------- SIGN IN ---------- */
  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    console.log("🟢 auth.tsx: signIn called");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { persistSession: rememberMe },
      });

      if (error) {
        console.error("🔴 auth.tsx: signIn error:", error);
        throw new Error(error.message || "Login failed");
      }

      if (!data?.session) {
        throw new Error("Login failed - no session returned");
      }

      await populateUserFromSession(data.session);
      console.log("🟢 auth.tsx: signIn complete!");
    } catch (err: any) {
      console.error("🔴 auth.tsx: signIn exception:", err);
      throw err;
    }
  };

  /* ---------- RESET PASSWORD ---------- */
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  /* ---------- SIGN UP ---------- */
  const signUp = async (email: string, password: string, name: string, username: string) => {
    console.log("🟠 auth.tsx: signUp called");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/make-server-6eb09999/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, username }),
      }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || "Failed to sign up");
    }

    await signIn(email, password);
    setJustSignedUp(true);
  };

  /* ---------- SIGN OUT ---------- */
  const signOut = async () => {
    console.log("🟠 auth.tsx: signOut called");
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    lastPopulatedUserId.current = null;
  };

  /* ---------- REFRESH SESSION ---------- */
  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (session) {
      lastPopulatedUserId.current = null; // Force refresh
      await populateUserFromSession(session);
    } else {
      setUser(null);
      setAccessToken(null);
    }
  };

  const clearJustSignedUp = () => setJustSignedUp(false);

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    justSignedUp,
    clearJustSignedUp,
    profile: user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ---------- hook ---------- */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}