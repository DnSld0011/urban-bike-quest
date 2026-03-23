import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Configuración del sistema</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center justify-center text-center">
        <Settings className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-card-foreground">Próximamente</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          La configuración del sistema, preferencias de notificaciones y ajustes de API estarán disponibles aquí una vez que el backend esté conectado.
        </p>
      </div>
    </div>
  );
}
