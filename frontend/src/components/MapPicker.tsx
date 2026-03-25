import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

export function MapPicker({ lat, lng, onChange, height = "250px" }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!containerRef.current) return;

    // Solo inicializar si no existe el mapa
    if (!mapRef.current) {
      const initialLat = lat || -12.0464;
      const initialLng = lng || -77.0428;

      const map = L.map(containerRef.current).setView([initialLat, initialLng], 14);

      // Usar un mapa moderno (CartoDB)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">Carto</a>'
      }).addTo(map);

      // Crear un pin de aspecto profesional
      const customIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:hsl(220, 90%, 56%);border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow: 0 4px 6px rgba(0,0,0,0.3); transform: translateY(-14px);">
          <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([initialLat, initialLng], { draggable: true, icon: customIcon }).addTo(map);

      // On Click: Move Marker
      map.on("click", (e) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        onChange(Number(newLat.toFixed(5)), Number(newLng.toFixed(5)));
      });

      // On Drag: Move Marker
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
      });

      mapRef.current = map;
      markerRef.current = marker;

      // Unos milisegundos para que el modal despliegue el flexbox y aplique el resize correcto
      setTimeout(() => { map.invalidateSize(); }, 300);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Deshabilitar la recreación del hook para mantener el mapa de Leaflet intacto.
    // Solo sincronizaremos visualmente cuando las coordenadas externas cambien, en otro hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync prop changes from outside (e.g., text inputs manually updated)
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        // Solo actualizar si hay una diferencia real para no estancarlo
        markerRef.current.setLatLng([lat || -12.0464, lng || -77.0428]);
        mapRef.current.setView([lat || -12.0464, lng || -77.0428]);
      }
    }
  }, [lat, lng]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border shadow-sm group">
      <div ref={containerRef} style={{ height, width: "100%", zIndex: 0 }} />
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-foreground font-medium border border-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Selecciona arrastrando el pin 📍
      </div>
    </div>
  );
}
