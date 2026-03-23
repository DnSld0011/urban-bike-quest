import { useEffect, useRef } from "react";
import L from "leaflet";
import { stations, sampleRoutes } from "@/data/mockData";
import type { Station } from "@/data/mockData";

function createStationIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:hsl(145,80%,50%);border-radius:50%;border:3px solid hsl(220,20%,7%);display:flex;align-items:center;justify-content:center;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220,20%,7%)" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface StationMapProps {
  showRoutes?: boolean;
  selectedStation?: Station | null;
  height?: string;
}

export function StationMap({ showRoutes = false, height = "400px" }: StationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40.758, -73.9855],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const icon = createStationIcon();

    stations.forEach((s) => {
      L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="color:#111;font-family:sans-serif"><strong>${s.name}</strong><br/>Bikes: ${s.activeBikes}/${s.capacity}</div>`
        );
    });

    if (showRoutes) {
      sampleRoutes.forEach((route) => {
        const latlngs = route.map((p) => [p.lat, p.lng] as [number, number]);
        L.polyline(latlngs, { color: "hsl(145,80%,50%)", weight: 3, opacity: 0.8 }).addTo(map);
      });
    }

    mapRef.current = map;

    // Fix tile rendering when container size isn't final at mount
    const timers = [
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 600),
    ];

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [showRoutes]);

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
