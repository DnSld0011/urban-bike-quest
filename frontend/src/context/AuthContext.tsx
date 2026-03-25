import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginApi, LoginResponse } from "@/api/auth";
import { UnauthorizedError } from "@/api/client";

// ─── Tipos ─────────────────────────────────────────────────────────────────
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

// ─── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helpers localStorage ──────────────────────────────────────────────────
const TOKEN_KEY = "access_token";
const USER_KEY  = "auth_user";

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  // Escuchar el evento 'unauthorized' disparado por apiRequest en 401
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: LoginResponse = await loginApi(email, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/**
 * Hook helper para envolver llamadas a la API y manejar errores de autenticación.
 * Ejemplo de uso:
 *   const { execute, loading, error } = useApiCall(getBikes);
 */
export function useApiCall<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          logout();
          setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        } else {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn, logout]
  );

  return { execute, loading, error };
}
