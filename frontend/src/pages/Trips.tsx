import { useQuery } from "@tanstack/react-query";
import { getRides } from "@/api/trips";
import { getBikes } from "@/api/bikes";
import { getStations } from "@/api/stations";
import { StatusBadge } from "@/components/StatusBadge";
import { Route, Search, Clock, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function Trips() {
  const { data: rides = [], isLoading } = useQuery({ queryKey: ["rides"], queryFn: getRides });
  const { data: bikes = [] } = useQuery({ queryKey: ["bikes"], queryFn: getBikes });
  const { data: stations = [] } = useQuery({ queryKey: ["stations"], queryFn: getStations });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mapas para resolver IDs a nombres
  const bikeMap = Object.fromEntries(bikes.map((b) => [b.id, b.code]));
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.name]));

  const enriched = rides.map((r) => ({
    ...r,
    bikeCode: bikeMap[r.bike_id] ?? `#${r.bike_id}`,
    startStationName: r.start_station_id ? (stationMap[r.start_station_id] ?? `Estación ${r.start_station_id}`) : "—",
    endStationName: r.end_station_id ? (stationMap[r.end_station_id] ?? `Estación ${r.end_station_id}`) : null,
    status: r.end_time ? "completed" : "active",
  }));

  const filtered = enriched.filter((r) => {
    const matchSearch =
      r.bikeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.startStationName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("es-PE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Viajes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Cargando..." : `${rides.length} viajes en total`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por bicicleta o estación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {{ all: "Todos", active: "Activo", completed: "Completado" }[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Bicicleta</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Ruta</TableHead>
                <TableHead className="text-muted-foreground">Inicio</TableHead>
                <TableHead className="text-muted-foreground text-right">Distancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <span className="font-mono font-semibold text-foreground">{r.bikeCode}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status as "active" | "completed"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-foreground">{r.startStationName}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground">{r.endStationName ?? "..."}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(r.start_time)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {r.distance ? `${r.distance} km` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    No se encontraron viajes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
