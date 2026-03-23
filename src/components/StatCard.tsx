import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  glow?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, glow }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${glow ? "glow-sm" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "+" : ""}{trend.value}% desde la semana pasada
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
