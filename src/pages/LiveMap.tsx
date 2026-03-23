import { StationMap } from "@/components/StationMap";
import { stations, trips } from "@/data/mockData";
import { MapPin, Bike, Route } from "lucide-react";

const activeTrips = trips.filter((t) => t.status === "active");

export default function LiveMap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time view of stations and active routes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-lg font-bold text-card-foreground">{stations.length}</p>
            <p className="text-xs text-muted-foreground">Stations</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Route className="w-5 h-5 text-warning" />
          <div>
            <p className="text-lg font-bold text-card-foreground">{activeTrips.length}</p>
            <p className="text-xs text-muted-foreground">Active Trips</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Bike className="w-5 h-5 text-success" />
          <div>
            <p className="text-lg font-bold text-card-foreground">
              {stations.reduce((a, s) => a + s.activeBikes, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Bikes Deployed</p>
          </div>
        </div>
      </div>

      <StationMap showRoutes height="calc(100vh - 300px)" />
    </div>
  );
}
