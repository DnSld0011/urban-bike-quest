import { apiRequest } from "./client";

// ─── Tipos ──────────────────────────────────────────────────────────────────
export interface BikeOut {
  id: number;
  code: string;
  status: "available" | "in_use" | "maintenance";
  station_id: number | null;
  latitude: number | null;
  longitude: number | null;
  total_km: number;
  max_km: number;
  last_maintenance_km: number;
  needs_maintenance: boolean;
  qr_path: string | null;
}

export interface BikeCreate {
  status?: string;
  station_id?: number;
  latitude?: number;
  longitude?: number;
  max_km?: number;
}

export interface BikeUpdate {
  status?: string;
  station_id?: number;
  latitude?: number;
  longitude?: number;
  total_km?: number;
  max_km?: number;
  last_maintenance_km?: number;
  needs_maintenance?: boolean;
}

export interface BikeHistoryItem {
  ride_id: number;
  user: { id: number; full_name: string; email: string };
  start_time: string | null;
  end_time: string | null;
  distance_km: number | null;
  start_station_id: number | null;
  end_station_id: number | null;
}

export interface BikeHistoryOut {
  bike_id: number;
  bike_code: string;
  total_km: number;
  total_rides: number;
  rides: BikeHistoryItem[];
}

// ─── API calls (todos requieren autenticación) ───────────────────────────────
export const getBikes = () =>
  apiRequest<BikeOut[]>("/bikes", { auth: true });

export const getBike = (id: number) =>
  apiRequest<BikeOut>(`/bikes/${id}`, { auth: true });

export const createBike = (data: BikeCreate) =>
  apiRequest<BikeOut>("/bikes", { method: "POST", body: JSON.stringify(data), auth: true });

export const updateBike = (id: number, data: BikeUpdate) =>
  apiRequest<BikeOut>(`/bikes/${id}`, { method: "PUT", body: JSON.stringify(data), auth: true });

export const deleteBike = (id: number) =>
  apiRequest<{ message: string }>(`/bikes/${id}`, { method: "DELETE", auth: true });

export const getBikeQrUrl = (id: number) => `/bikes/${id}/qr`;

export const getBikeHistory = (id: number) =>
  apiRequest<BikeHistoryOut>(`/bikes/${id}/history`, { auth: true });
