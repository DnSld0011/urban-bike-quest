import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser, UserOut, UserCreate, UserUpdate } from "@/api/users";
import { getRoles } from "@/api/roles";
import { Users, Shield, Wrench, UserPlus, Loader2, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const emptyForm = {
  full_name: "", email: "", phone: "", address: "", dni: "", password: "", role_id: 1,
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserOut | null>(null);
  const [form, setForm] = useState(emptyForm);

  const createMut = useMutation({
    mutationFn: (data: UserCreate) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdate }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario actualizado");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (u: UserOut) => {
    setEditing(u);
    setForm({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || "",
      address: u.address || "",
      dni: u.dni || "",
      password: "",
      role_id: u.role_id || 1
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.full_name || !form.email) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    if (editing) {
      const updateData: UserUpdate = { ...form };
      if (!updateData.password) delete updateData.password;
      updateMut.mutate({ id: editing.id, data: updateData });
    } else {
      if (!form.password) {
        toast.error("La contraseña es obligatoria para nuevos usuarios");
        return;
      }
      createMut.mutate(form as UserCreate);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">Administrar usuarios y roles del sistema</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground font-semibold">
              <UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {[
                { label: "Nombre completo", key: "full_name", type: "text" },
                { label: "Correo electrónico", key: "email", type: "email" },
                { label: "Teléfono", key: "phone", type: "text" },
                { label: "Dirección", key: "address", type: "text" },
                { label: "DNI / Número de identidad", key: "dni", type: "text" },
                { label: "Contraseña", key: "password", type: "password" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <Label className="text-muted-foreground text-xs">
                    {label} {key === 'password' && editing ? "(Dejar vacío para no cambiar)" : ""}
                  </Label>
                  <Input
                    type={type}
                    value={(form as any)[key] || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              ))}
              <div>
                <Label className="text-muted-foreground text-xs">Rol</Label>
                <select
                  value={form.role_id ?? ""}
                  onChange={(e) => setForm({ ...form, role_id: +e.target.value })}
                  className="w-full rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2 mt-1"
                >
                  <option value="" disabled>Selecciona un rol...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gradient-primary text-primary-foreground font-semibold"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Correo</TableHead>
                <TableHead className="text-muted-foreground">Teléfono</TableHead>
                <TableHead className="text-muted-foreground">Rol</TableHead>
                <TableHead className="text-muted-foreground">DNI</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                        {u.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{u.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.phone ?? "—"}</TableCell>
                  <TableCell>
                    {(() => {
                      const role = roles.find((r) => r.id === u.role_id);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          u.role_id === 1
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-warning/15 text-warning border-warning/30"
                        }`}>
                          {u.role_id === 1 ? <Shield className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                          {role ? role.name : `Rol #${u.role_id}`}
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">{u.dni ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Seguro que deseas eliminar al usuario ${u.full_name}?`)) {
                            deleteMut.mutate(u.id);
                          }
                        }}
                        disabled={deleteMut.isPending}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No hay usuarios registrados
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
