import { apiRequest } from "./client";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
  };
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/login-json", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
