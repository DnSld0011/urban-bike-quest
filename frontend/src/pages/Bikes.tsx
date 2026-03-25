import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBikes, createBike, updateBike, deleteBike, downloadBikeQrAuth, getBikeHistory, BikeOut, BikeCreate, BikeUpdate } from "@/api/bikes";
import { getStations } from "@/api/stations";
import { StatusBadge } from "@/components/StatusBadge";
import { Bike, Search, Filter, Loader2, Wrench, Plus, Edit, Trash2, QrCode, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabels: Record<string, string> = {
  all: "Todos",
  available: "Disponible",
  in_use: "En Uso",
  maintenance: "Mantenimiento",
};

export default function Bikes() {
  const queryClient = useQueryClient();
  const { data: bikes = [], isLoading } = useQuery({ queryKey: ["bikes"], queryFn: getBikes });
  const { data: stations = [] } = useQuery({ queryKey: ["stations"], queryFn: getStations });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BikeOut | null>(null);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyBike, setHistoryBike] = useState<BikeOut | null>(null);
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["bikeHistory", historyBike?.id],
    queryFn: () => getBikeHistory(historyBike!.id),
    enabled: !!historyBike,
  });

  // En creación no pedimos 'code' (se autogenera). Sí pedimos station_id y max_km
  const [form, setForm] = useState({ 
    status: "available",
    station_id: "",
    max_km: 50
  });

  const filtered = bikes.filter((b) => {
    const matchSearch = b.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const createMut = useMutation({
    mutationFn: (data: BikeCreate) => createBike(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      toast.success("Bicicleta registrada con éxito. QR autogenerado.");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BikeUpdate }) => updateBike(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      toast.success("Bicicleta actualizada");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteBike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      toast.success("Bicicleta eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ status: "available", station_id: "", max_km: 50 });
    setDialogOpen(true);
  };

  const openHistory = (b: BikeOut) => {
    setHistoryBike(b);
    setHistoryOpen(true);
  };

  const openEdit = (b: BikeOut) => {
    setEditing(b);
    setForm({ 
      status: b.status, 
      station_id: b.station_id ? b.station_id.toString() : "", 
      max_km: b.max_km || 50 
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = {
      status: form.status,
      station_id: form.station_id ? parseInt(form.station_id) : undefined,
      max_km: form.max_km
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const handleDownloadQr = async (id: number) => {
    try {
      toast.loading("Descargando QR...", { id: "qr-download" });
      await downloadBikeQrAuth(id);
      toast.success("Código QR descargado", { id: "qr-download" });
    } catch (e) {
      toast.error("Error al descargar QR", { id: "qr-download" });
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  const getStationName = (stationId: number | null) => {
    if (!stationId) return "Sin base";
    const st = stations.find((s) => s.id === stationId);
    return st ? st.name : `Estación #${stationId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bicicletas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando..." : `${bikes.length} bicicletas registradas (Autocodificadas secuencialmente)`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Registrar Bicicleta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editing ? "Editar Bicicleta" : "Registrar Nueva Bicicleta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!editing && (
                <div className="text-xs text-muted-foreground bg-primary/10 p-3 rounded-md border border-primary/20">
                  <span className="font-semibold text-primary">Nota:</span> El identificador UUID y el código QR de esta bicicleta se generarán automáticamente al guardarla.
                </div>
              )}
              {editing && (
                <div>
                  <Label className="text-muted-foreground">Código (Solo lectura)</Label>
                  <Input value={editing.code} disabled className="bg-secondary/50 border-border font-mono text-xs" />
                </div>
              )}
              
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <select 
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                >
                  <option value="available">Disponible</option>
                  <option value="in_use">En Uso</option>
                  <option value="maintenance">En Mantenimiento</option>
                </select>
              </div>

              <div>
                <Label className="text-muted-foreground">Estación Base (Opcional)</Label>
                <select 
                  value={form.station_id}
                  onChange={(e) => setForm({...form, station_id: e.target.value})}
                  className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                >
                  <option value="">Ninguna</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-muted-foreground">Km máximo antes de mantenimiento</Label>
                <Input 
                  type="number" 
                  value={form.max_km} 
                  onChange={(e) => setForm({ ...form, max_km: parseFloat(e.target.value) || 0 })} 
                  className="bg-secondary border-border" 
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary text-primary-foreground font-semibold">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Actualizar" : "Registrar Bicicleta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {["all", "available", "in_use", "maintenance"].map((s) => (
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Código (UUID)</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Mantenimiento</TableHead>
                <TableHead className="text-muted-foreground text-right w-[120px]">Ubicación</TableHead>
                <TableHead className="text-muted-foreground text-right w-[150px]">Límite KM</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id} className="border-border hover:bg-secondary/50 group">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-primary" />
                        <span className="font-mono font-semibold text-foreground text-xs" title={b.code}>
                          {b.code}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Acumulado: {b.total_km.toFixed(1)} km
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell>
                    {b.needs_maintenance ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-warning font-medium">
                        <Wrench className="w-3 h-3" /> Requiere servicio
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">OK</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {getStationName(b.station_id)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-foreground">{b.max_km} km</span>
                      <div className="w-full bg-secondary h-1.5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${b.total_km >= b.max_km ? 'bg-warning' : 'bg-primary'}`} 
                          style={{ width: `${Math.min((b.total_km / b.max_km) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDownloadQr(b.id)} 
                        title="Descargar QR"
                        className="p-1.5 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openHistory(b)} 
                        title="Ver Historial"
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(b)} title="Editar" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => {
                          if (window.confirm(`¿Seguro que deseas eliminar esta bicicleta?`)) {
                            deleteMut.mutate(b.id);
                          }
                        }}
                        disabled={deleteMut.isPending}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No se encontraron bicicletas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* DIÁLOGO DE HISTORIAL */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto w-11/12 mx-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Historial de Viajes - Bicicleta <span className="font-mono text-primary text-sm ml-2">{historyBike?.code.split('-')[0]}</span>
            </DialogTitle>
          </DialogHeader>
          
          {historyLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : historyData ? (
             <div className="space-y-4 mt-2">
                <div className="flex gap-4 mb-4 text-sm bg-secondary/30 p-3 rounded-lg border border-border">
                  <div><span className="text-muted-foreground">Viajes totales:</span> <span className="font-semibold text-foreground">{historyData.total_rides}</span></div>
                  <div><span className="text-muted-foreground">KM recorridos:</span> <span className="font-semibold text-foreground">{historyData.total_km.toFixed(1)} km</span></div>
                </div>

                {historyData.rides.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Esta bicicleta aún no ha realizado ningún viaje.</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-secondary/20">
                        <TableRow>
                          <TableHead className="text-muted-foreground">Usuario</TableHead>
                          <TableHead className="text-muted-foreground">Inicio</TableHead>
                          <TableHead className="text-muted-foreground">Fin</TableHead>
                          <TableHead className="text-muted-foreground">Ruta</TableHead>
                          <TableHead className="text-muted-foreground text-right">Distancia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyData.rides.map(r => (
                          <TableRow key={r.ride_id} className="border-border">
                            <TableCell className="font-medium text-foreground">
                              {r.user.full_name}
                              <div className="text-xs text-muted-foreground">{r.user.email}</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {r.start_time ? new Date(r.start_time).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {r.end_time ? new Date(r.end_time).toLocaleString() : 'En curso'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              Origen: {getStationName(r.start_station_id)} <br/>
                              Destino: {r.end_time ? getStationName(r.end_station_id) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm text-foreground">
                              {r.distance_km ? `${r.distance_km} km` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
             </div>
          ) : (
            <p className="text-center text-destructive py-4">Error al cargar el historial.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
