"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";
import { projectId, publicAnonKey } from "@/supabase/info";

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
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- supabase client ---------- */

const supabaseUrl = `https://${projectId}.supabase.co`;
console.log("🟠 auth.tsx: Supabase URL", supabaseUrl);

const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  publicAnonKey
);

/* ---------- provider ---------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function populateUserFromSession(session: Session) {
    try {
      const supaUser = session.user;
      console.log("🟢 auth.tsx: populateUserFromSession", supaUser.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supaUser.id)
        .maybeSingle();

      if (profileError) {
        console.warn(
          "🟡 auth.tsx: populateUserFromSession profile error",
          profileError
        );
      }

      setUser({
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
      });

      setAccessToken(session.access_token);
    } catch (err) {
      console.error("🔴 auth.tsx: populateUserFromSession exception", err);
    }
  }

  /* ---------- SIGN IN (fixed – no timeout wrapper) ---------- */

  const signIn = async (email: string, password: string) => {
    console.log("🟢 auth.tsx: signIn called");
    console.log("   → email:", email);
    console.log("   → password length:", password?.length ?? 0);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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

      // Fetch user profile to get display name, etc.
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn(
          "🟡 auth.tsx: signIn profile fetch error (non-fatal):",
          profileError
        );
      }

      console.log("🟢 auth.tsx: setting user + access token");
      setUser({
        id: data.user.id,
        email: data.user.email!,
        name:
          profileData?.full_name ||
          profileData?.username ||
          data.user.user_metadata?.name ||
          data.user.email ||
          "User",
        username: profileData?.username,
        avatar_url: profileData?.avatar_url,
      });
      setAccessToken(data.session.access_token);
      console.log("🟢 auth.tsx: signIn complete!");
    } catch (err: any) {
      console.error("🔴 auth.tsx: signIn exception:", err);
      throw err;
    }
  };

  /* ---------- SIGN UP (uses edge function) ---------- */

  const signUp = async (email: string, password: string, name: string) => {
    console.log("🟠 auth.tsx: signUp called with", { email, name });

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-6eb09999/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
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

      // After signup, call Supabase directly to sign the user in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(
          "🔴 auth.tsx: signUp->signIn error from Supabase:",
          error
        );
        throw new Error(error.message || "Sign up succeeded but login failed");
      }

      if (!data || !data.session || !data.user) {
        console.error(
          "🔴 auth.tsx: signUp->signIn missing session or user",
          data
        );
        throw new Error(
          "Sign up succeeded but login failed - no session returned"
        );
      }

      await populateUserFromSession(data.session);
    } catch (err: any) {
      console.error("🔴 auth.tsx: signUp exception", err);
      throw err;
    }
  };

  /* ---------- SIGN OUT ---------- */

  const signOut = async () => {
    console.log("🟠 auth.tsx: signOut called");
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("🔴 auth.tsx: signOut error", err);
    } finally {
      setUser(null);
      setAccessToken(null);
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

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
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
