import { useState } from "react";
import { stations as initialStations, Station } from "@/data/mockData";
import { StationMap } from "@/components/StationMap";
import { MapPin, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Stations() {
  const [stationsList, setStations] = useState<Station[]>(initialStations);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [form, setForm] = useState({ name: "", lat: "", lng: "", capacity: "" });

  const filtered = stationsList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", lat: "", lng: "", capacity: "" });
    setDialogOpen(true);
  };

  const openEdit = (s: Station) => {
    setEditing(s);
    setForm({ name: s.name, lat: String(s.lat), lng: String(s.lng), capacity: String(s.capacity) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.lat || !form.lng || !form.capacity) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    if (editing) {
      setStations((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? { ...s, name: form.name, lat: +form.lat, lng: +form.lng, capacity: +form.capacity }
            : s
        )
      );
      toast.success("Estación actualizada");
    } else {
      const newStation: Station = {
        id: `s${Date.now()}`,
        name: form.name,
        lat: +form.lat,
        lng: +form.lng,
        capacity: +form.capacity,
        activeBikes: 0,
      };
      setStations((prev) => [...prev, newStation]);
      toast.success("Estación creada");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setStations((prev) => prev.filter((s) => s.id !== id));
    toast.success("Estación eliminada");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">{stationsList.length} estaciones registradas</p>
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
              <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground font-semibold">
                {editing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <StationMap height="350px" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar estaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

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
                  <p className="text-xs text-muted-foreground">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Bicis: <span className="text-primary font-semibold">{s.activeBikes}</span>/{s.capacity}
              </div>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full"
                  style={{ width: `${(s.activeBikes / s.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
