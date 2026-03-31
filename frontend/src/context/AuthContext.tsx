import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginApi, LoginResponse } from "@/api/auth";
import { UnauthorizedError, BASE_URL } from "@/api/client";

// ─── Tipos ─────────────────────────────────────────────────────────────────
export interface RolePermission {
  module: string;
  can_view: boolean;
  can_edit: boolean;
}

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
  permissions: RolePermission[];   // Lista de permisos del rol activo
  can: (module: string, action?: "view" | "edit") => boolean; // Helper de permisos
}

// ─── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helpers localStorage ──────────────────────────────────────────────────
const TOKEN_KEY = "access_token";
const USER_KEY  = "auth_user";
const PERMS_KEY = "role_permissions";

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function loadPermissions(): RolePermission[] {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    return raw ? (JSON.parse(raw) as RolePermission[]) : [];
  } catch {
    return [];
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [permissions, setPermissions] = useState<RolePermission[]>(loadPermissions);

  // Helper: el Admin (role_id=1) siempre puede todo; para el resto revisar permissions
  const can = useCallback(
    (module: string, action: "view" | "edit" = "view"): boolean => {
      if (!user) return false;
      if (user.role_id === 1) return true; // Superadmin bypass
      const perm = permissions.find((p) => p.module === module);
      if (!perm) return false;
      return action === "edit" ? perm.can_edit : perm.can_view;
    },
    [user, permissions]
  );

  // Función para cargar permisos del rol desde el backend
  const fetchPermissions = useCallback(async (_roleId: number, jwt: string) => {
    try {
      // Usamos /users/me/permissions en lugar de /roles/{id}
      // porque esa ruta es accesible por cualquier usuario autenticado
      const res = await fetch(`${BASE_URL}/users/me/permissions`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) return;
      const perms: RolePermission[] = await res.json();
      setPermissions(perms);
      localStorage.setItem(PERMS_KEY, JSON.stringify(perms));
    } catch {
      // Si falla simplemente quedan los permisos vacíos
    }
  }, []);

  // Escuchar el evento 'unauthorized' disparado por apiRequest en 401
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setPermissions([]);
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
    // Cargar permisos justo al hacer login
    if (res.user.role_id && res.user.role_id !== 1) {
      await fetchPermissions(res.user.role_id, res.access_token);
    } else {
      // Superadmin: no necesita permisos explícitos
      setPermissions([]);
      localStorage.removeItem(PERMS_KEY);
    }
  }, [fetchPermissions]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMS_KEY);
    setUser(null);
    setToken(null);
    setPermissions([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, token, permissions, can }}
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
