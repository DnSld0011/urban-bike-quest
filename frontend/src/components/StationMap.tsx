import { useEffect, useRef } from "react";
import L from "leaflet";
import type { StationOut } from "@/api/stations";

function createStationIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:hsl(145,80%,50%);border-radius:50%;border:3px solid hsl(220,20%,7%);display:flex;align-items:center;justify-content:center;box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220,20%,7%)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
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

  // Stringify the stations so the effect only triggers when the actual data changes
  const stationsFingerprint = JSON.stringify(
    stations.map((s) => ({ id: s.id, lat: s.latitude, lng: s.longitude, cap: s.capacity }))
  );

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

      const map = L.map(container);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = createStationIcon();
      const bounds = L.latLngBounds([]);

      stations.forEach((s) => {
        L.marker([s.latitude, s.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="color:#111;font-family:sans-serif;text-align:center;">
              <strong style="font-size:14px;">${s.name}</strong><br/>
              <span style="font-size:12px;color:#555;">Capacidad: ${s.capacity}</span>
            </div>`
          );
        bounds.extend([s.latitude, s.longitude]);
      });

      if (stations.length > 0) {
        if (stations.length === 1) {
          map.setView([stations[0].latitude, stations[0].longitude], 14);
        } else {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        // Fallback default center to Lima, Peru
        map.setView([-12.0464, -77.0428], 13);
      }

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
  }, [showRoutes, stationsFingerprint]); // Dependencies updated!

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm" style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />
    </div>
  );
}
