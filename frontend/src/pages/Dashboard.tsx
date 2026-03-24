import { useQuery } from "@tanstack/react-query";
import { Bike, MapPin, Route, Wrench, TrendingUp, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { getBikes } from "@/api/bikes";
import { getStations } from "@/api/stations";
import { getRides } from "@/api/trips";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";

// Datos de gráfico de viajes por día (últimos 7 días basado en rides reales)
function buildTripsPerDay(rides: Awaited<ReturnType<typeof getRides>>) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const counts: Record<string, number> = {};
  rides.forEach((r) => {
    if (!r.start_time) return;
    const d = new Date(r.start_time);
    const label = days[d.getDay()];
    counts[label] = (counts[label] ?? 0) + 1;
  });
  return days.map((d) => ({ day: d, trips: counts[d] ?? 0 }));
}

export default function Dashboard() {
  const { data: bikes = [] } = useQuery({ queryKey: ["bikes"], queryFn: getBikes });
  const { data: stations = [] } = useQuery({ queryKey: ["stations"], queryFn: getStations });
  const { data: rides = [] } = useQuery({ queryKey: ["rides"], queryFn: getRides });

  const activeBikes = bikes.filter((b) => b.status === "in_use").length;
  const maintenanceBikes = bikes.filter((b) => b.status === "maintenance" || b.needs_maintenance).length;
  const activeRides = rides.filter((r) => !r.end_time).length;
  const totalRides = rides.length;

  const bikeStatusData = [
    { name: "Disponible", value: bikes.filter((b) => b.status === "available").length, fill: "hsl(145 65% 40%)" },
    { name: "En Uso", value: activeBikes, fill: "hsl(38 92% 50%)" },
    { name: "Mantenimiento", value: bikes.filter((b) => b.status === "maintenance").length, fill: "hsl(0 72% 50%)" },
  ];

  // Uso por estación: contar rides que parten de cada estación
  const usageByStation = stations.slice(0, 8).map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + "." : s.name,
    usage: rides.filter((r) => r.start_station_id === s.id).length,
  }));

  const tripsPerDay = buildTripsPerDay(rides);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen de tu red de bicicletas compartidas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Viajes" value={totalRides} icon={Route} trend={{ value: 12, positive: true }} glow />
        <StatCard title="Bicis Activas" value={activeBikes} subtitle={`de ${bikes.length} en total`} icon={Bike} />
        <StatCard title="En Mantenimiento" value={maintenanceBikes} icon={Wrench} />
        <StatCard title="Estaciones" value={stations.length} subtitle={`${activeRides} viajes activos`} icon={MapPin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Viajes esta Semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={tripsPerDay}>
              <defs>
                <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(215 90% 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(215 90% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 85%)" className="dark:[&>line]:stroke-[hsl(220,15%,18%)]" />
              <XAxis dataKey="day" tick={{ fill: "hsl(220 10% 45%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 10% 45%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Area type="monotone" dataKey="trips" stroke="hsl(215 90% 50%)" fill="url(#tripGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Estado de Bicicletas</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={bikeStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                {bikeStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {bikeStatusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
                <span className="text-xs text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Uso por Estación</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={usageByStation}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 85%)" className="dark:[&>line]:stroke-[hsl(220,15%,18%)]" />
            <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220 10% 45%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            <Bar dataKey="usage" fill="hsl(215 90% 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
