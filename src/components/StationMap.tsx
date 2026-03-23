import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { stations, sampleRoutes } from "@/data/mockData";
import type { Station, RoutePoint } from "@/data/mockData";

const stationIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:hsl(145,80%,50%);border-radius:50%;border:3px solid hsl(220,20%,7%);display:flex;align-items:center;justify-content:center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220,20%,7%)" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface StationMapProps {
  showRoutes?: boolean;
  selectedStation?: Station | null;
  height?: string;
}

export function StationMap({ showRoutes = false, height = "400px" }: StationMapProps) {
  const center: [number, number] = [40.7580, -73.9855];

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={stationIcon}>
            <Popup>
              <div style={{ color: "#111", fontFamily: "sans-serif" }}>
                <strong>{s.name}</strong>
                <br />
                Bikes: {s.activeBikes}/{s.capacity}
              </div>
            </Popup>
          </Marker>
        ))}
        {showRoutes &&
          sampleRoutes.map((route, i) => (
            <Polyline
              key={i}
              positions={route.map((p: RoutePoint) => [p.lat, p.lng] as [number, number])}
              pathOptions={{ color: "hsl(145,80%,50%)", weight: 3, opacity: 0.8 }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
