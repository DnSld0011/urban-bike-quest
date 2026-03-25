import { apiRequest } from "./client";

// ─── Tipos ──────────────────────────────────────────────────────────────────
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

export interface RidePointOut {
  id: number;
  ride_id: number;
  latitude: number;
  longitude: number;
  timestamp: string | null;
}

// ─── Start Ride ──────────────────────────────────────────────────────────────
export interface StartRideRequest {
  user_id: number;
  bike_id: number;
  latitude?: number;
  longitude?: number;
}

export interface StartRideResponse {
  ride: RideOut;
  message: string;
}

export const startRide = (data: StartRideRequest) =>
  apiRequest<StartRideResponse>("/start-ride", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });

// ─── GPS Tracking ────────────────────────────────────────────────────────────
export const addRidePoint = (rideId: number, latitude: number, longitude: number) =>
  apiRequest<RidePointOut>("/ride-points", {
    method: "POST",
    body: JSON.stringify({ ride_id: rideId, latitude, longitude }),
    auth: true,
  });

export const getRidePoints = (rideId: number) =>
  apiRequest<RidePointOut[]>(`/ride-points/${rideId}`, { auth: true });

// ─── End Ride ────────────────────────────────────────────────────────────────
export interface EndRideRequest {
  ride_id: number;
  latitude: number;
  longitude: number;
}

export interface NearestStationInfo {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
}

export interface EndRideResponse {
  ride: RideOut;
  nearest_station: NearestStationInfo;
  total_distance_km: number;
  km_added_to_bike: number;
  duration_minutes: number;
  message: string;
}

export const endRide = (data: EndRideRequest) =>
  apiRequest<EndRideResponse>("/end-ride", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });

// ─── CRUD rides ──────────────────────────────────────────────────────────────
export interface RideCreate {
  user_id: number;
  bike_id: number;
  start_station_id?: number;
  end_station_id?: number;
  distance?: number;
}

export interface RideUpdate {
  end_station_id?: number;
  end_time?: string;
  distance?: number;
}

export const getRides = () =>
  apiRequest<RideOut[]>("/rides", { auth: true });

export const getRide = (id: number) =>
  apiRequest<RideOut>(`/rides/${id}`, { auth: true });

export const createRide = (data: RideCreate) =>
  apiRequest<RideOut>("/rides", { method: "POST", body: JSON.stringify(data), auth: true });

export const updateRide = (id: number, data: RideUpdate) =>
  apiRequest<RideOut>(`/rides/${id}`, { method: "PUT", body: JSON.stringify(data), auth: true });

export const deleteRide = (id: number) =>
  apiRequest<{ message: string }>(`/rides/${id}`, { method: "DELETE", auth: true });
