import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBikes, createBike, updateBike, deleteBike, BikeOut, BikeCreate, BikeUpdate } from "@/api/bikes";
import { StatusBadge } from "@/components/StatusBadge";
import { Bike, Search, Filter, Loader2, Wrench, Plus, Edit, Trash2 } from "lucide-react";
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BikeOut | null>(null);
  const [form, setForm] = useState({ code: "", status: "available" });

  const filtered = bikes.filter((b) => {
    const matchSearch = b.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const createMut = useMutation({
    mutationFn: (data: BikeCreate) => createBike(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      toast.success("Bicicleta registrada");
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
    setForm({ code: "", status: "available" });
    setDialogOpen(true);
  };

  const openEdit = (b: BikeOut) => {
    setEditing(b);
    setForm({ code: b.code, status: b.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code) {
      toast.error("El código es obligatorio");
      return;
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, data: { code: form.code, status: form.status } });
    } else {
      createMut.mutate({ code: form.code, status: form.status });
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bicicletas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando..." : `${bikes.length} bicicletas registradas`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Nueva Bicicleta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editing ? "Editar Bicicleta" : "Nueva Bicicleta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Código identificador</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-secondary border-border" />
              </div>
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
              <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary text-primary-foreground font-semibold">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableHead className="text-muted-foreground">Código</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Mantenimiento</TableHead>
                <TableHead className="text-muted-foreground text-right">KM Total</TableHead>
                <TableHead className="text-muted-foreground text-right">Último servicio (km)</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
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
                  <TableCell>
                    {b.needs_maintenance ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-warning font-medium">
                        <Wrench className="w-3 h-3" /> Requiere servicio
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">OK</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {b.total_km.toLocaleString()} km
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground text-sm">
                    {b.last_maintenance_km.toLocaleString()} km
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Seguro que deseas eliminar la bicicleta ${b.code}?`)) {
                            deleteMut.mutate(b.id);
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
                    No se encontraron bicicletas
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
