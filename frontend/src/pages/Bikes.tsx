import { useState } from "react";
import { bikes as initialBikes } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { Bike, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function Bikes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = initialBikes.filter((b) => {
    const matchSearch = b.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", "available", "in_use", "maintenance"] as const;
  const statusLabels: Record<string, string> = {
    all: "Todos",
    available: "Disponible",
    in_use: "En Uso",
    maintenance: "Mantenimiento",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bicicletas</h1>
        <p className="text-sm text-muted-foreground mt-1">{initialBikes.length} bicicletas registradas</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {statuses.map((s) => (
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
              <TableHead className="text-muted-foreground">Código</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Estación</TableHead>
              <TableHead className="text-muted-foreground text-right">KM Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id} className="border-border hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-primary" />
                    <span className="font-mono font-semibold text-foreground">{b.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {b.stationName || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-foreground">
                  {b.totalKm.toLocaleString()} km
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
