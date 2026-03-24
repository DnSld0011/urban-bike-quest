// ─── Cliente HTTP base que apunta al backend FastAPI ───────────────────────
const BASE_URL = "http://localhost:8000";

// Lee el token JWT guardado en localStorage
function getToken(): string | null {
  return localStorage.getItem("access_token");
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // si true, adjunta el header Authorization
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = false, headers = {}, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: finalHeaders,
    ...rest,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail ?? `HTTP ${response.status}`);
  }

  // Para respuestas 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
