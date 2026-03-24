interface StatusBadgeProps {
  status: "available" | "in_use" | "maintenance" | "active" | "completed";
}

const config: Record<string, { label: string; classes: string }> = {
  available: { label: "Disponible", classes: "bg-success/15 text-success border-success/30" },
  in_use: { label: "En Uso", classes: "bg-warning/15 text-warning border-warning/30" },
  maintenance: { label: "Mantenimiento", classes: "bg-destructive/15 text-destructive border-destructive/30" },
  active: { label: "Activo", classes: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completado", classes: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status] || { label: status || "Desconocido", classes: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-glow" />
      {c.label}
    </span>
  );
}
