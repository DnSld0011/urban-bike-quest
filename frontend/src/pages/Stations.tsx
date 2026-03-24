import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStations, createStation, updateStation, deleteStation, StationOut, StationCreate } from "@/api/stations";
import { StationMap } from "@/components/StationMap";
import { MapPin, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Stations() {
  const queryClient = useQueryClient();
  const { data: stationsList = [], isLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: getStations,
  });

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StationOut | null>(null);
  const [form, setForm] = useState({ name: "", lat: "", lng: "", capacity: "" });

  const createMut = useMutation({
    mutationFn: (data: StationCreate) => createStation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Estación creada");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StationCreate }) => updateStation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Estación actualizada");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteStation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Estación eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = stationsList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", lat: "", lng: "", capacity: "" });
    setDialogOpen(true);
  };

  const openEdit = (s: StationOut) => {
    setEditing(s);
    setForm({ name: s.name, lat: String(s.latitude), lng: String(s.longitude), capacity: String(s.capacity) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.lat || !form.lng || !form.capacity) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    const data: StationCreate = {
      name: form.name,
      latitude: +form.lat,
      longitude: +form.lng,
      capacity: +form.capacity,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, data });
    } else {
      createMut.mutate(data);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando..." : `${stationsList.length} estaciones registradas`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Agregar Estación
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editing ? "Editar Estación" : "Nueva Estación"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Latitud</Label>
                  <Input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Longitud</Label>
                  <Input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="bg-secondary border-border" />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Capacidad</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="bg-secondary border-border" />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary text-primary-foreground font-semibold">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <StationMap stations={stationsList} height="350px" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar estaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMut.mutate(s.id)}
                    disabled={deleteMut.isPending}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="text-xs text-muted-foreground">
                  Capacidad: <span className="text-primary font-semibold">{s.capacity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
