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
