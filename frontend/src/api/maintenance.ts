import { apiRequest } from "./client";

export interface MaintenanceOut {
  id: number;
  bike_id: number;
  date: string | null;
  description: string | null;
  km_at_service: number | null;
}

export interface MaintenanceCreate {
  bike_id: number;
  description?: string;
  km_at_service?: number;
}

export const getMaintenances = () =>
  apiRequest<MaintenanceOut[]>("/maintenance", { auth: true });

export const createMaintenance = (data: MaintenanceCreate) =>
  apiRequest<MaintenanceOut>("/maintenance", { method: "POST", body: JSON.stringify(data), auth: true });
