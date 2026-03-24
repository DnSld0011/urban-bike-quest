import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSetting } from "@/api/settings";
import { Save, Loader2, Cloud, Bell, Shield, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings = [], isLoading } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [form, setForm] = useState<Record<string, string>>({
    OPENWEATHER_API_KEY: "",
    NOTIFICATION_EMAIL: "",
    PREDICTION_ENABLED: "false",
    MAINTENANCE_MODE: "false"
  });

  useEffect(() => {
    if (settings.length > 0) {
      const newForm = { ...form };
      settings.forEach(s => {
        newForm[s.key] = s.value;
      });
      setForm(newForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const updateMut = useMutation({
    mutationFn: async (vars: { key: string, value: string }[]) => {
      await Promise.all(vars.map(v => updateSetting(v.key, { value: v.value })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configuración guardada correctamente");
    },
    onError: (e: Error) => toast.error("Error al guardar: " + e.message)
  });

  const handleSave = () => {
    const vars = Object.entries(form).map(([key, value]) => ({ key, value }));
    updateMut.mutate(vars);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Administra los parámetros generales del sistema</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta API Clima */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-card-foreground">Integraciones y API</h2>
            </div>
            
            <div>
              <Label className="text-muted-foreground text-xs font-medium">OpenWeatherMap API Key</Label>
              <div className="relative mt-1.5">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password"
                  placeholder="Introduce tu clave de API..."
                  value={form.OPENWEATHER_API_KEY}
                  onChange={e => setForm({...form, OPENWEATHER_API_KEY: e.target.value})}
                  className="pl-9 bg-secondary border-border"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Requerido para la predicción de temperatura (Fase 4).</p>
            </div>
          </div>

          {/* Tarjeta Notificaciones */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-card-foreground">Notificaciones</h2>
            </div>
            
            <div>
              <Label className="text-muted-foreground text-xs font-medium">Correo electrónico de alertas</Label>
              <Input 
                type="email"
                placeholder="admin@tuempresa.com"
                value={form.NOTIFICATION_EMAIL}
                onChange={e => setForm({...form, NOTIFICATION_EMAIL: e.target.value})}
                className="mt-1.5 bg-secondary border-border"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Para recibir avisos de mantenimiento.</p>
            </div>
          </div>

          {/* Tarjeta Sistema */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-card-foreground">Ajustes del Sistema</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground text-xs font-medium">Algoritmo de Predicción</Label>
                <select 
                  value={form.PREDICTION_ENABLED}
                  onChange={e => setForm({...form, PREDICTION_ENABLED: e.target.value})}
                  className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                >
                  <option value="true">Activado</option>
                  <option value="false">Desactivado</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1.5">Al activarse el cron computará promedios de bicis a la medianoche.</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-medium">Modo Mantenimiento</Label>
                <select 
                  value={form.MAINTENANCE_MODE}
                  onChange={e => setForm({...form, MAINTENANCE_MODE: e.target.value})}
                  className="w-full mt-1.5 rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2"
                >
                  <option value="true">Activo (Bloquear app)</option>
                  <option value="false">Inactivo (Operativo)</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1.5">Evita que se efectúen nuevos viajes desde terminales.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <Button 
          onClick={handleSave} 
          disabled={updateMut.isPending}
          className="gradient-primary text-primary-foreground font-semibold px-8"
        >
          {updateMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {updateMut.isPending ? "Guardando..." : "Guardar Ajustes"}
        </Button>
      </div>

    </div>
  );
}
