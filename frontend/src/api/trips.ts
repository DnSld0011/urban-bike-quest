import { apiRequest } from "./client";

export interface RideOut {
  id: number;
  user_id: number;
  bike_id: number;
  start_station_id: number | null;
  end_station_id: number | null;
  start_time: string | null;
  end_time: string | null;
  distance: number | null;
}

export interface RideCreate {
  user_id: number;
  bike_id: number;
  start_station_id?: number;
  end_station_id?: number;
  distance?: number;
}

export interface RidePointOut {
  id: number;
  ride_id: number;
  latitude: number;
  longitude: number;
  timestamp: string | null;
}

export const getRides = () =>
  apiRequest<RideOut[]>("/rides");

export const getRide = (id: number) =>
  apiRequest<RideOut>(`/rides/${id}`);

export const createRide = (data: RideCreate) =>
  apiRequest<RideOut>("/rides", { method: "POST", body: JSON.stringify(data) });

export const getRidePoints = (rideId: number) =>
  apiRequest<RidePointOut[]>(`/ride-points/${rideId}`);

export interface RideUpdate {
  end_station_id?: number;
  end_time?: string;
  distance?: number;
}

export const updateRide = (id: number, data: RideUpdate) =>
  apiRequest<RideOut>(`/rides/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteRide = (id: number) =>
  apiRequest<{ message: string }>(`/rides/${id}`, { method: "DELETE" });
