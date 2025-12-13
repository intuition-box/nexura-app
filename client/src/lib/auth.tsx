import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "./queryClient";
import { setSessionToken, clearSession, getSessionToken, onSessionChange, emitSessionChange } from "./session";
import { toast } from "@/hooks/use-toast";
import { buildUrl } from "@/lib/queryClient";

type User = any;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (username: string, referrer?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Build auth headers
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const token = getSessionToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
          console.log("🔑 Sending Authorization header for /api/me");
        } else {
          console.log("❌ No accessToken found for /api/me");
        }

        // Use apiRequest which includes Authorization: Bearer <token> when present
        const res = await apiRequest("GET", "/api/me").catch(err => {
          console.warn("Network error fetching profile:", String(err));
          return null;
        });

        console.log("passed first fetch");
        
        if (!res || !res.ok) {
          console.warn("Could not restore session: API returned", res?.status || "no response");
          try { clearSession(); } catch { /* ignore */ }
          setUser(null);
          setLoading(false);
          return;
        }
        
        const json = await res.json().catch(() => null);
        if (!json) {
          console.warn("Could not parse profile response");
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("passed json parse");
        
        // /api/me returns { user, profile, hasProfile }
        // Validate that user is an object before setting
        const userData = json?.user ? { ...json.user, ...(json.profile || {}) } : null;
        
        console.log('[AuthProvider] Received data from /api/me:', {
          hasUser: !!json?.user,
          hasProfile: !!json?.profile,
          userDataType: typeof userData,
          isArray: Array.isArray(userData),
          isNull: userData === null,
          keys: userData ? Object.keys(userData) : []
        });
        
        if (userData && typeof userData === 'object' && !Array.isArray(userData) && userData !== null) {
          console.log('[AuthProvider] Setting valid user data');
          console.log("dilly");
          setUser(userData);
        } else {
          console.error('[AuthProvider] Invalid user data structure:', typeof userData, Array.isArray(userData), userData);
          setUser(null);
        }
      } catch (e) {
        console.warn("Could not restore session:", e);
        try { clearSession(); } catch { /* ignore */ }
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    const unsub = onSessionChange(async () => {
      try {
        const res = await apiRequest("GET", "/api/me");
        if (res.ok) {
          const json = await res.json();
          const userData = json?.user ? { ...json.user, ...(json.profile || {}) } : null;

          console.log('[AuthProvider] Session change - received data:', {
            hasUser: !!json?.user,
            hasProfile: !!json?.profile,
            userDataType: typeof userData,
            isArray: Array.isArray(userData),
            isNull: userData === null
          });

          if (userData && typeof userData === 'object' && !Array.isArray(userData) && userData !== null) {
            console.log('[AuthProvider] Session change - setting valid user data');
            setUser(userData);
            toast({ title: "Profile updated", description: "Your progress has been refreshed" });
          } else {
            console.error('[AuthProvider] Invalid user data on session change:', typeof userData);
          }
          return;
        }
      } catch (e) {
        console.warn("[AuthProvider] Failed to fetch profile after session change:", String(e));
      }
      // Do not clear the existing user on transient session-refresh failures.
      // Keep the current user state to avoid flicker; the app can re-fetch
      // explicitly if needed.
    });

    return () => unsub();
  }, []);

  async function signUp(username: string, referrer?: string) {
    const payload: any = { username };
    if (referrer) payload.referrer = referrer;

    const res = await apiRequest("POST", "/sign-up", payload);
    const json = await res.json();
    const accessToken = json?.accessToken;
    if (accessToken) {
      try {
        setSessionToken(accessToken);
      } catch (e) {
        console.warn("failed to persist token", e);
      }

      // fetch profile
      try {
        const p = await apiRequest("GET", "/profile");
        const pj = await p.json();
        setUser(pj?.user ?? pj);
      } catch (e) {
        console.warn("failed to fetch profile after signup", e);
      }
    } else {
      throw new Error("no accessToken returned from sign-up");
    }
  }

  function signOut() {
    (async () => {
      try {
        // call server to clear httpOnly cookie/session
        await apiRequest("POST", "/auth/logout");
      } catch (e) {
        // ignore server logout errors, proceed to clear client state
        console.warn("server logout failed", e);
      }

      try {
        clearSession();
        // notify listeners that session was cleared
        try { emitSessionChange(); } catch (e) { /* ignore */ }
      } catch (e) {
        /* ignore */
      }
      setUser(null);
    })();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
