import { StationMap } from "@/components/StationMap";
import { useQuery } from "@tanstack/react-query";
import { getStations } from "@/api/stations";
import { getRides } from "@/api/trips";
import { getBikes } from "@/api/bikes";
import { MapPin, Bike, Route } from "lucide-react";

export default function LiveMap() {
  const { data: stations = [] } = useQuery({ queryKey: ["stations"], queryFn: getStations });
  const { data: rides = [] } = useQuery({ queryKey: ["rides"], queryFn: getRides });
  const { data: bikes = [] } = useQuery({ queryKey: ["bikes"], queryFn: getBikes });

  const activeTrips = rides.filter((t) => !t.end_time);
  const activeBikes = bikes.filter((b) => b.status === "in_use");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mapa en Vivo</h1>
        <p className="text-sm text-muted-foreground mt-1">Vista en tiempo real de estaciones y rutas activas</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-lg font-bold text-card-foreground">{stations.length}</p>
            <p className="text-xs text-muted-foreground">Estaciones</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Route className="w-5 h-5 text-warning" />
          <div>
            <p className="text-lg font-bold text-card-foreground">{activeTrips.length}</p>
            <p className="text-xs text-muted-foreground">Viajes Activos</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Bike className="w-5 h-5 text-success" />
          <div>
            <p className="text-lg font-bold text-card-foreground">
              {activeBikes.length}
            </p>
            <p className="text-xs text-muted-foreground">Bicis Desplegadas</p>
          </div>
        </div>
      </div>

      <StationMap stations={stations} activeTrips={activeTrips} height="calc(100vh - 300px)" />
    </div>
  );
}
