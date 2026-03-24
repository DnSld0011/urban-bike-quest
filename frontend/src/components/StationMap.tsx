import { useEffect, useRef } from "react";
import L from "leaflet";
import type { StationOut } from "@/api/stations";

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
  stations?: StationOut[];
  showRoutes?: boolean;
  selectedStation?: StationOut | null;
  height?: string;
}

export function StationMap({ stations = [], showRoutes = false, height = "400px" }: StationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    // Poll until container has stable non-zero dimensions
    const waitForLayout = () => {
      if (cancelled) return;
      const { offsetWidth, offsetHeight } = el;
      if (offsetWidth > 100 && offsetHeight > 100) {
        initMap(el);
      } else {
        requestAnimationFrame(waitForLayout);
      }
    };

    const initMap = (container: HTMLDivElement) => {
      if (mapRef.current || cancelled) return;

      const map = L.map(container, {
        center: [40.758, -73.9855],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = createStationIcon();

      stations.forEach((s) => {
        L.marker([s.latitude, s.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="color:#111;font-family:sans-serif"><strong>${s.name}</strong><br/>Capacidad max: ${s.capacity}</div>`
          );
      });

      if (showRoutes) {
        // Logica para obtener rutas si es proveida via props en el futuro
      }

      mapRef.current = map;

      // Keep checking size for sidebar transitions
      let lastWidth = container.offsetWidth;
      const sizeCheck = setInterval(() => {
        if (!mapRef.current) {
          clearInterval(sizeCheck);
          return;
        }
        const currentWidth = container.offsetWidth;
        if (currentWidth !== lastWidth) {
          lastWidth = currentWidth;
          mapRef.current.invalidateSize();
        }
      }, 100);

      // Stop polling after 3 seconds
      setTimeout(() => clearInterval(sizeCheck), 3000);
    };

    requestAnimationFrame(waitForLayout);

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showRoutes]);

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
