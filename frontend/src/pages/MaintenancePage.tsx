import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMaintenances, createMaintenance, MaintenanceCreate } from "@/api/maintenance";
import { getBikes } from "@/api/bikes";
import { Wrench, Plus, Loader2, Calendar, Bike } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { data: maintenances = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: getMaintenances,
  });
  const { data: bikes = [] } = useQuery({ queryKey: ["bikes"], queryFn: getBikes });

  const bikeMap = Object.fromEntries(bikes.map((b) => [b.id, b.code]));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ bike_id: string; description: string; km_at_service: string }>({
    bike_id: "", description: "", km_at_service: "",
  });

  const createMut = useMutation({
    mutationFn: (data: MaintenanceCreate) => createMaintenance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      toast.success("Registro de mantenimiento creado");
      setDialogOpen(false);
      setForm({ bike_id: "", description: "", km_at_service: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = () => {
    if (!form.bike_id) { toast.error("Selecciona una bicicleta"); return; }
    createMut.mutate({
      bike_id: +form.bike_id,
      description: form.description || undefined,
      km_at_service: form.km_at_service ? +form.km_at_service : undefined,
    });
  };

  // Bicis que necesitan mantenimiento
  const needService = bikes.filter((b) => b.needs_maintenance || b.status === "maintenance");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mantenimiento</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro y proyección de mantenimiento de bicicletas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Registrar Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nuevo Registro de Mantenimiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Bicicleta</Label>
                <select
                  value={form.bike_id}
                  onChange={(e) => setForm({ ...form, bike_id: e.target.value })}
                  className="w-full mt-1 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                >
                  <option value="">Seleccionar bicicleta...</option>
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id}>{b.code} — {b.total_km.toFixed(0)} km</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Descripción del servicio</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: Cambio de frenos, ajuste de cadena..."
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">KM al momento del servicio</Label>
                <Input
                  type="number"
                  value={form.km_at_service}
                  onChange={(e) => setForm({ ...form, km_at_service: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={createMut.isPending}
                className="w-full gradient-primary text-primary-foreground font-semibold"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de bicicletas que necesitan servicio */}
      {needService.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-warning">{needService.length} bicicleta(s) requieren atención</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {needService.map((b) => (
              <span key={b.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/15 text-warning text-xs font-mono font-medium border border-warning/30">
                <Bike className="w-3 h-3" />
                {b.code} — {b.total_km.toFixed(0)} km
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Historial de mantenimientos */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Historial de servicios</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : maintenances.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Wrench className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay registros de mantenimiento aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {maintenances.map((m) => (
              <div key={m.id} className="rounded-lg border border-border bg-card p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {bikeMap[m.bike_id] ?? `Bici #${m.bike_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.description ?? "Sin descripción"}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                    <Calendar className="w-3 h-3" />
                    {m.date ? new Date(m.date).toLocaleDateString("es-PE") : "—"}
                  </div>
                  {m.km_at_service != null && (
                    <p className="text-xs font-mono text-foreground mt-1">{m.km_at_service.toLocaleString()} km</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
