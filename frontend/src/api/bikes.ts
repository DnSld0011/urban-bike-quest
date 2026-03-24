import { apiRequest } from "./client";

export interface BikeOut {
  id: number;
  code: string;
  status: "available" | "in_use" | "maintenance";
  total_km: number;
  last_maintenance_km: number;
  needs_maintenance: boolean;
}

export interface BikeCreate {
  code: string;
  status?: string;
}

export const getBikes = () =>
  apiRequest<BikeOut[]>("/bikes");

export const createBike = (data: BikeCreate) =>
  apiRequest<BikeOut>("/bikes", { method: "POST", body: JSON.stringify(data) });

export interface BikeUpdate {
  code?: string;
  status?: string;
  total_km?: number;
  last_maintenance_km?: number;
  needs_maintenance?: boolean;
}

export const updateBike = (id: number, data: BikeUpdate) =>
  apiRequest<BikeOut>(`/bikes/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteBike = (id: number) =>
  apiRequest<{ message: string }>(`/bikes/${id}`, { method: "DELETE" });
