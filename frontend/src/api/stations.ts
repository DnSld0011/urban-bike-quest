import { apiRequest } from "./client";

export interface StationOut {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
}

export interface StationCreate {
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
}

export const getStations = () =>
  apiRequest<StationOut[]>("/stations");

export const createStation = (data: StationCreate) =>
  apiRequest<StationOut>("/stations", { method: "POST", body: JSON.stringify(data), auth: true });

export const updateStation = (id: number, data: StationCreate) =>
  apiRequest<StationOut>(`/stations/${id}`, { method: "PUT", body: JSON.stringify(data), auth: true });

export const deleteStation = (id: number) =>
  apiRequest<void>(`/stations/${id}`, { method: "DELETE", auth: true });
