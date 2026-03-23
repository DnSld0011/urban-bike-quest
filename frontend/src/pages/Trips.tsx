import { useState } from "react";
import { trips } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { Route, Search, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function Trips() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = trips.filter((t) => {
    const matchSearch = t.bikeCode.toLowerCase().includes(search.toLowerCase()) ||
      t.startStation.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusLabels: Record<string, string> = {
    all: "Todos",
    active: "Activo",
    completed: "Completado",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Viajes</h1>
        <p className="text-sm text-muted-foreground mt-1">{trips.length} viajes en total</p>
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
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Bicicleta</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Ruta</TableHead>
              <TableHead className="text-muted-foreground">Hora</TableHead>
              <TableHead className="text-muted-foreground text-right">Distancia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} className="border-border hover:bg-secondary/50">
                <TableCell>
                  <span className="font-mono font-semibold text-foreground">{t.bikeCode}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground">{t.startStation}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground">{t.endStation || "..."}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(t.startTime)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-foreground">
                  {t.distance ? `${t.distance} km` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
