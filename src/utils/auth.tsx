import React, {
  createContext,
  useContext,
  useEffect,
  useState,
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
    detectSessionInUrl: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});
// Export the supabase client for use in other modules
export { supabase };

/* ---------- utility functions ---------- */

/**
 * Gets the display name (first name only) from a user object
 */
export function getUserDisplayName(user: any): string {
  if (!user) return 'User';

  // Try to get the name from the user object
  if (user.name && typeof user.name === 'string') {
    // Return just the first name (split by space and take first part)
    return user.name.trim().split(/\s+/)[0];
  }

  // Fallback to username
  if (user.username) {
    return user.username;
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

  // Load initial session
  useEffect(() => {
    console.log("🟠 auth.tsx: useEffect -> loadInitialSession");

    async function loadInitialSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("🔴 auth.tsx: getSession error", error);
        }

        if (session?.user) {
          console.log(
            "🟢 auth.tsx: Existing session found for user",
            session.user.id
          );
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🟠 auth.tsx: onAuthStateChange", event, {
        hasSession: !!session,
      });

      if (session?.user) {
        await populateUserFromSession(session);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle app resume from background
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 App resumed, refreshing session...');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('✅ Session found on resume, restoring user');
            await populateUserFromSession(session);
          } else {
            console.log('❌ No session found on resume');
          }
        } catch (error) {
          console.error('❌ Error refreshing session on resume:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function populateUserFromSession(session: Session) {
    try {
      const supaUser = session.user;
      console.log("🟢 auth.tsx: populateUserFromSession", supaUser.id);

      // Add a 5-second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout after 5 seconds')), 5000)
      );
      
      const fetchPromise = supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", supaUser.id)
        .maybeSingle();
      
      console.log("🟡 Starting profile fetch with timeout...");
      
      // Race between fetch and timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      console.log("🟡 Profile fetch completed:", result);
      
      const { data: profile, error: profileError } = result;

      if (profileError) {
        console.warn(
          "🟡 auth.tsx: populateUserFromSession profile error",
          profileError
        );
      }

      const userData = {
        id: supaUser.id,
        email: supaUser.email ?? "",
        name:
          profile?.full_name ||
          profile?.username ||
          supaUser.user_metadata?.name ||
          supaUser.email ||
          "User",
        username: profile?.username,
        avatar_url: profile?.avatar_url,
      };

      console.log("🟢 Setting user:", userData);
      setUser(userData);
      setAccessToken(session.access_token);
      console.log("🟢 User set complete!");
    } catch (err) {
      console.error("🔴 auth.tsx: populateUserFromSession exception", err);
      
      // FALLBACK: Set basic user even on error so UI isn't stuck
      const fallbackUser = {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.email?.split("@")[0] || "User",
        username: undefined,
        avatar_url: undefined,
      };
      
      console.log("🟠 Setting fallback user due to error:", fallbackUser);
      setUser(fallbackUser);
      setAccessToken(session.access_token);
    }
  }

  /* ---------- SIGN IN ---------- */

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    console.log("🟢 auth.tsx: signIn called");
    console.log("   → email:", email);
    console.log("   → password length:", password?.length ?? 0);
    console.log("   → remember me:", rememberMe);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: rememberMe,
        },
      });

      console.log("🟢 auth.tsx: Supabase response:", { data, error });

      if (error) {
        console.error("🔴 auth.tsx: signIn error from Supabase:", error);
        throw new Error(error.message || "Login failed");
      }

      if (!data || !data.session || !data.user) {
        console.error("🔴 auth.tsx: signIn missing session or user", data);
        throw new Error("Login failed - no session returned from Supabase");
      }

      await populateUserFromSession(data.session);
      console.log("🟢 auth.tsx: signIn complete!");
    } catch (err: any) {
      console.error("🔴 auth.tsx: signIn exception:", err);
      throw err;
    }
  };

        const resetPassword = async (email: string) => {
        console.log('🔵🔵🔵 auth.tsx: resetPassword CALLED');
        console.log('🔵 Email parameter:', email);
        console.log('🔵 Supabase client exists?', !!supabase);
        console.log('🔵 Redirect URL:', `${window.location.origin}/reset-password`);
        
        try {
          console.log('🔵 About to call supabase.auth.resetPasswordForEmail...');
          
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
      
          console.log('🔵 Reset password response DATA:', data);
          console.log('🔵 Reset password response ERROR:', error);
      
          if (error) {
            console.error('❌ auth.tsx: Password reset error:', error);
            throw error;
          }
      
          console.log('✅ auth.tsx: Password reset email request completed');
        } catch (error) {
          console.error('❌ auth.tsx: Exception in resetPassword:', error);
          throw error;
        }
      };

  /* ---------- SIGN UP ---------- */

  const signUp = async (email: string, password: string, name: string, username: string) => {
    console.log("🟠 auth.tsx: signUp called with", { email, name, username });

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-6eb09999/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email, 
            password, 
            name,
            username 
          }),
        }
      );

      console.log("🟠 auth.tsx: signUp response status", response.status);

      const payload = await response.json().catch(() => null);
      console.log("🟠 auth.tsx: signUp response payload", payload);

      if (!response.ok) {
        const message =
          (payload && (payload.error || payload.message)) ||
          "Failed to sign up";
        throw new Error(message);
      }

      await signIn(email, password);
      setJustSignedUp(true);
    } catch (err: any) {
      console.error("🔴 auth.tsx: signUp exception", err);
      throw err;
    }
  };

  /* ---------- SIGN OUT ---------- */

  let isSigningOut = false;

  const signOut = async () => {
    if (isSigningOut) {
      console.log("🟡 auth.tsx: signOut already in progress, skipping");
      return;
    }
    
    isSigningOut = true;
    console.log("🟠 auth.tsx: signOut called");
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (err) {
      console.error("🔴 auth.tsx: signOut error", err);
    } finally {
      isSigningOut = false;
    }
  };

  /* ---------- REFRESH SESSION ---------- */

  const refreshSession = async () => {
    console.log("🟠 auth.tsx: refreshSession called");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("🔴 auth.tsx: refreshSession error", error);
        throw error;
      }

      if (session) {
        await populateUserFromSession(session);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch (err) {
      console.error("🔴 auth.tsx: refreshSession exception", err);
      throw err;
    }
  };

  const clearJustSignedUp = () => {
    setJustSignedUp(false);
  };

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
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}