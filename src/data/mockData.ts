export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  activeBikes: number;
}

export interface Bike {
  id: string;
  code: string;
  status: "available" | "in_use" | "maintenance";
  totalKm: number;
  stationId: string | null;
  stationName: string | null;
}

export interface Trip {
  id: string;
  bikeCode: string;
  startStation: string;
  endStation: string | null;
  startTime: string;
  endTime: string | null;
  distance: number | null;
  status: "active" | "completed";
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "technical";
  idNumber: string;
}

export const stations: Station[] = [
  { id: "s1", name: "Centro Histórico", lat: 40.7829, lng: -73.9654, capacity: 30, activeBikes: 18 },
  { id: "s2", name: "Estación Centro", lat: 40.7580, lng: -73.9855, capacity: 25, activeBikes: 12 },
  { id: "s3", name: "Muelle Ribereño", lat: 40.8010, lng: -73.9712, capacity: 20, activeBikes: 15 },
  { id: "s4", name: "Puente Brooklyn", lat: 40.7061, lng: -73.9969, capacity: 35, activeBikes: 22 },
  { id: "s5", name: "Plaza Principal", lat: 40.7580, lng: -73.9855, capacity: 40, activeBikes: 28 },
  { id: "s6", name: "Plaza Unión", lat: 40.7359, lng: -73.9911, capacity: 22, activeBikes: 10 },
  { id: "s7", name: "Barrio Este", lat: 40.7265, lng: -73.9815, capacity: 18, activeBikes: 8 },
  { id: "s8", name: "Mercado Chelsea", lat: 40.7425, lng: -74.0061, capacity: 28, activeBikes: 20 },
];

export const bikes: Bike[] = [
  { id: "b1", code: "BK-001", status: "available", totalKm: 1247.5, stationId: "s1", stationName: "Centro Histórico" },
  { id: "b2", code: "BK-002", status: "in_use", totalKm: 892.3, stationId: null, stationName: null },
  { id: "b3", code: "BK-003", status: "maintenance", totalKm: 2103.8, stationId: "s2", stationName: "Estación Centro" },
  { id: "b4", code: "BK-004", status: "available", totalKm: 567.1, stationId: "s1", stationName: "Centro Histórico" },
  { id: "b5", code: "BK-005", status: "in_use", totalKm: 1834.6, stationId: null, stationName: null },
  { id: "b6", code: "BK-006", status: "available", totalKm: 423.9, stationId: "s3", stationName: "Muelle Ribereño" },
  { id: "b7", code: "BK-007", status: "maintenance", totalKm: 3201.2, stationId: "s4", stationName: "Puente Brooklyn" },
  { id: "b8", code: "BK-008", status: "available", totalKm: 156.4, stationId: "s5", stationName: "Plaza Principal" },
  { id: "b9", code: "BK-009", status: "in_use", totalKm: 2456.7, stationId: null, stationName: null },
  { id: "b10", code: "BK-010", status: "available", totalKm: 789.2, stationId: "s6", stationName: "Plaza Unión" },
  { id: "b11", code: "BK-011", status: "available", totalKm: 345.8, stationId: "s7", stationName: "Barrio Este" },
  { id: "b12", code: "BK-012", status: "in_use", totalKm: 1567.3, stationId: null, stationName: null },
];

export const trips: Trip[] = [
  { id: "t1", bikeCode: "BK-002", startStation: "Centro Histórico", endStation: null, startTime: "2026-03-23T08:30:00", endTime: null, distance: null, status: "active" },
  { id: "t2", bikeCode: "BK-005", startStation: "Estación Centro", endStation: null, startTime: "2026-03-23T09:15:00", endTime: null, distance: null, status: "active" },
  { id: "t3", bikeCode: "BK-009", startStation: "Puente Brooklyn", endStation: null, startTime: "2026-03-23T10:00:00", endTime: null, distance: null, status: "active" },
  { id: "t4", bikeCode: "BK-012", startStation: "Plaza Principal", endStation: null, startTime: "2026-03-23T10:45:00", endTime: null, distance: null, status: "active" },
  { id: "t5", bikeCode: "BK-001", startStation: "Muelle Ribereño", endStation: "Centro Histórico", startTime: "2026-03-23T07:00:00", endTime: "2026-03-23T07:35:00", distance: 4.2, status: "completed" },
  { id: "t6", bikeCode: "BK-004", startStation: "Plaza Unión", endStation: "Mercado Chelsea", startTime: "2026-03-22T16:00:00", endTime: "2026-03-22T16:25:00", distance: 2.8, status: "completed" },
  { id: "t7", bikeCode: "BK-006", startStation: "Barrio Este", endStation: "Estación Centro", startTime: "2026-03-22T14:30:00", endTime: "2026-03-22T15:00:00", distance: 3.5, status: "completed" },
  { id: "t8", bikeCode: "BK-008", startStation: "Centro Histórico", endStation: "Plaza Principal", startTime: "2026-03-22T12:00:00", endTime: "2026-03-22T12:20:00", distance: 2.1, status: "completed" },
  { id: "t9", bikeCode: "BK-010", startStation: "Puente Brooklyn", endStation: "Plaza Unión", startTime: "2026-03-21T09:00:00", endTime: "2026-03-21T09:45:00", distance: 5.6, status: "completed" },
  { id: "t10", bikeCode: "BK-011", startStation: "Mercado Chelsea", endStation: "Barrio Este", startTime: "2026-03-21T11:30:00", endTime: "2026-03-21T12:00:00", distance: 3.1, status: "completed" },
];

export const sampleRoutes: RoutePoint[][] = [
  [
    { lat: 40.7829, lng: -73.9654, timestamp: "2026-03-23T08:30:00" },
    { lat: 40.7800, lng: -73.9700, timestamp: "2026-03-23T08:35:00" },
    { lat: 40.7750, lng: -73.9750, timestamp: "2026-03-23T08:40:00" },
    { lat: 40.7700, lng: -73.9800, timestamp: "2026-03-23T08:45:00" },
    { lat: 40.7650, lng: -73.9830, timestamp: "2026-03-23T08:50:00" },
    { lat: 40.7580, lng: -73.9855, timestamp: "2026-03-23T08:55:00" },
  ],
  [
    { lat: 40.7580, lng: -73.9855, timestamp: "2026-03-23T09:15:00" },
    { lat: 40.7500, lng: -73.9900, timestamp: "2026-03-23T09:20:00" },
    { lat: 40.7400, lng: -73.9920, timestamp: "2026-03-23T09:25:00" },
    { lat: 40.7300, lng: -73.9950, timestamp: "2026-03-23T09:30:00" },
    { lat: 40.7200, lng: -73.9960, timestamp: "2026-03-23T09:35:00" },
    { lat: 40.7061, lng: -73.9969, timestamp: "2026-03-23T09:40:00" },
  ],
];

export const chartData = {
  tripsPerDay: [
    { day: "Lun", trips: 42 },
    { day: "Mar", trips: 58 },
    { day: "Mié", trips: 65 },
    { day: "Jue", trips: 51 },
    { day: "Vie", trips: 73 },
    { day: "Sáb", trips: 89 },
    { day: "Dom", trips: 67 },
  ],
  usageByStation: [
    { name: "Centro Hist.", usage: 156 },
    { name: "Est. Centro", usage: 134 },
    { name: "Muelle", usage: 98 },
    { name: "Puente Bklyn", usage: 187 },
    { name: "Plaza Ppal.", usage: 210 },
    { name: "Plaza Unión", usage: 112 },
    { name: "Barrio Este", usage: 78 },
    { name: "Chelsea", usage: 145 },
  ],
  bikeStatus: [
    { name: "Disponible", value: 7, fill: "hsl(145 65% 40%)" },
    { name: "En Uso", value: 4, fill: "hsl(38 92% 50%)" },
    { name: "Mantenimiento", value: 2, fill: "hsl(0 72% 50%)" },
  ],
};

export const users: User[] = [
  { id: "u1", fullName: "Alex Rivera", email: "alex@bikeshare.com", phone: "+57-300-555-0101", role: "admin", idNumber: "ID-90001" },
  { id: "u2", fullName: "Jordan Chen", email: "jordan@bikeshare.com", phone: "+57-300-555-0102", role: "technical", idNumber: "ID-90002" },
  { id: "u3", fullName: "Sam Okafor", email: "sam@bikeshare.com", phone: "+57-300-555-0103", role: "technical", idNumber: "ID-90003" },
];
