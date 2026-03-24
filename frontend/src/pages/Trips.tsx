import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRides, createRide, updateRide, deleteRide, RideOut, RideCreate, RideUpdate } from "@/api/trips";
import { getBikes } from "@/api/bikes";
import { getStations } from "@/api/stations";
import { getUsers } from "@/api/users";
import { StatusBadge } from "@/components/StatusBadge";
import { Route, Search, Clock, MapPin, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const emptyForm = { user_id: "", bike_id: "", start_station_id: "", end_station_id: "", distance: "" };

export default function Trips() {
  const queryClient = useQueryClient();
  const { data: rides = [], isLoading } = useQuery({ queryKey: ["rides"], queryFn: getRides });
  const { data: bikes = [] } = useQuery({ queryKey: ["bikes"], queryFn: getBikes });
  const { data: stations = [] } = useQuery({ queryKey: ["stations"], queryFn: getStations });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RideOut | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const createMut = useMutation({
    mutationFn: (data: RideCreate) => createRide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast.success("Viaje registrado");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RideUpdate }) => updateRide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast.success("Viaje actualizado");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteRide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      toast.success("Viaje eliminado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: RideOut) => {
    setEditing(r);
    setForm({
      user_id: String(r.user_id),
      bike_id: String(r.bike_id),
      start_station_id: r.start_station_id ? String(r.start_station_id) : "",
      end_station_id: r.end_station_id ? String(r.end_station_id) : "",
      distance: r.distance ? String(r.distance) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.user_id || !form.bike_id) {
      toast.error("Usuario y Bicicleta son obligatorios");
      return;
    }
    
    if (editing) {
      const updateData: RideUpdate = {};
      if (form.end_station_id) updateData.end_station_id = +form.end_station_id;
      if (form.distance) updateData.distance = +form.distance;
      // If completing trip and it was active:
      if (form.end_station_id && !editing.end_time) {
        updateData.end_time = new Date().toISOString();
      }
      updateMut.mutate({ id: editing.id, data: updateData });
    } else {
      const createData: RideCreate = {
        user_id: +form.user_id,
        bike_id: +form.bike_id,
      };
      if (form.start_station_id) createData.start_station_id = +form.start_station_id;
      if (form.end_station_id) createData.end_station_id = +form.end_station_id;
      if (form.distance) createData.distance = +form.distance;
      createMut.mutate(createData);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Viajes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando..." : `${rides.length} viajes en total`}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Registrar Viaje
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editing ? "Editar Viaje" : "Nuevo Viaje"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!editing && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Usuario</Label>
                    <select
                      value={form.user_id}
                      onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                      className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                    >
                      <option value="">Seleccione un usuario...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bicicleta</Label>
                    <select
                      value={form.bike_id}
                      onChange={(e) => setForm({ ...form, bike_id: e.target.value })}
                      className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                    >
                      <option value="">Seleccione una bicicleta...</option>
                      {bikes.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estación Inicio</Label>
                    <select
                      value={form.start_station_id}
                      onChange={(e) => setForm({ ...form, start_station_id: e.target.value })}
                      className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                    >
                      <option value="">Ninguna...</option>
                      {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <Label className="text-muted-foreground">Estación Fin</Label>
                <select
                  value={form.end_station_id}
                  onChange={(e) => setForm({ ...form, end_station_id: e.target.value })}
                  className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                >
                  <option value="">Ninguna (Viaje en curso)...</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Distancia (km)</Label>
                <Input type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="bg-secondary border-border" />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary text-primary-foreground font-semibold">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Actualizar y Completar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("¿Seguro que deseas eliminar este viaje?")) {
                            deleteMut.mutate(r.id);
                          }
                        }}
                        disabled={deleteMut.isPending}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
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
