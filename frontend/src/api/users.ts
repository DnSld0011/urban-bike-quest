import { apiRequest } from "./client";

export interface UserOut {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  dni: string | null;
  role_id: number | null;
}

export interface UserCreate {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  dni?: string;
  password: string;
  role_id?: number;
}

export const getUsers = () =>
  apiRequest<UserOut[]>("/users", { auth: true });

export const createUser = (data: UserCreate) =>
  apiRequest<UserOut>("/users", { method: "POST", body: JSON.stringify(data) });
