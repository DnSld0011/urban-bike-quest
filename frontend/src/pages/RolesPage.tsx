import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles, createRole, setRolePermissions, deleteRole,
  ALL_MODULES, RoleWithPermissions, RolePermissionSet,
} from "@/api/roles";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Shield, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// ── Mini componente: Tabla de checkboxes de permisos ─────────────────────────
function PermissionsMatrix({
  permissions,
  onChange,
}: {
  permissions: RolePermissionSet[];
  onChange: (perms: RolePermissionSet[]) => void;
}) {
  const toggle = (module: string, field: "can_view" | "can_edit") => {
    onChange(
      permissions.map((p) =>
        p.module === module ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-x-auto mt-2">
      <Table>
        <TableHeader className="bg-secondary/20">
          <TableRow>
            <TableHead className="text-muted-foreground">Módulo</TableHead>
            <TableHead className="text-center text-muted-foreground">Ver</TableHead>
            <TableHead className="text-center text-muted-foreground">Editar / Crear / Borrar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ALL_MODULES.map((mod) => {
            const perm = permissions.find((p) => p.module === mod.key) ?? {
              module: mod.key, can_view: false, can_edit: false,
            };
            return (
              <TableRow key={mod.key} className="border-border">
                <TableCell className="font-medium text-foreground">{mod.label}</TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary cursor-pointer"
                    checked={perm.can_view}
                    onChange={() => toggle(mod.key, "can_view")}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary cursor-pointer"
                    checked={perm.can_edit}
                    onChange={() => toggle(mod.key, "can_edit")}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Modal de edición de permisos ──────────────────────────────────────────────
function EditPermissionsDialog({ role }: { role: RoleWithPermissions }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const initialPerms: RolePermissionSet[] = ALL_MODULES.map((mod) => {
    const existing = role.permissions.find((p) => p.module === mod.key);
    return {
      module: mod.key,
      can_view: existing?.can_view ?? false,
      can_edit: existing?.can_edit ?? false,
    };
  });

  const [perms, setPerms] = useState<RolePermissionSet[]>(initialPerms);

  const saveMut = useMutation({
    mutationFn: () => setRolePermissions(role.id, perms),
    onSuccess: () => {
      toast.success(`Permisos de "${role.name}" guardados`);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          title="Configurar permisos"
        >
          <Shield className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-xl w-11/12">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Permisos del Rol: <span className="text-primary font-bold">{role.name}</span>
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Activa los módulos a los que este rol podrá acceder. "Editar" incluye crear y borrar.
        </p>
        <PermissionsMatrix permissions={perms} onChange={setPerms} />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-border">
            Cancelar
          </Button>
          <Button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="gradient-primary text-primary-foreground font-semibold"
          >
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar Permisos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function RolesPage() {
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const [newRoleName, setNewRoleName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const createMut = useMutation({
    mutationFn: () => createRole({ name: newRoleName.trim() }),
    onSuccess: () => {
      toast.success("Rol creado exitosamente");
      setNewRoleName("");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Rol eliminado");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles y Permisos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando..." : `${roles.length} roles configurados`}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Crear nuevo Rol</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label className="text-muted-foreground">Nombre del Rol</Label>
              <Input
                placeholder="Ej: Supervisor, Operador, Ciclista..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="bg-secondary/50 border-border"
              />
              <Button
                onClick={() => createMut.mutate()}
                disabled={!newRoleName.trim() || createMut.isPending}
                className="w-full gradient-primary text-primary-foreground font-semibold"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear Rol
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de roles */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Nombre del Rol</TableHead>
                <TableHead className="text-muted-foreground">Módulos con acceso de lectura</TableHead>
                <TableHead className="text-muted-foreground">Módulos con acceso de edición</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const viewModules = role.permissions.filter((p) => p.can_view).map((p) =>
                  ALL_MODULES.find((m) => m.key === p.module)?.label ?? p.module
                );
                const editModules = role.permissions.filter((p) => p.can_edit).map((p) =>
                  ALL_MODULES.find((m) => m.key === p.module)?.label ?? p.module
                );
                return (
                  <TableRow key={role.id} className="border-border hover:bg-secondary/50 group">
                    <TableCell className="font-mono text-xs text-muted-foreground">#{role.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{role.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {viewModules.length ? viewModules.join(", ") : <span className="italic">Ninguno</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {editModules.length ? editModules.join(", ") : <span className="italic">Ninguno</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                        <EditPermissionsDialog role={role} />
                        {role.id !== 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar el rol "${role.name}"?`)) {
                                deleteMut.mutate(role.id);
                              }
                            }}
                            title="Eliminar"
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    No hay roles configurados. Crea el primero.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
