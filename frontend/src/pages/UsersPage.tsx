import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, UserCreate } from "@/api/users";
import { Users, Shield, Wrench, UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const emptyForm: UserCreate = {
  full_name: "", email: "", phone: "", address: "", dni: "", password: "", role_id: 1,
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<UserCreate>(emptyForm);

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = () => {
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Nombre, email y contraseña son obligatorios");
      return;
    }
    createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">Administrar usuarios y roles del sistema</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-semibold">
              <UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nuevo Usuario</DialogTitle>
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
                  <Label className="text-muted-foreground text-xs">{label}</Label>
                  <Input
                    type={type}
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              ))}
              <div>
                <Label className="text-muted-foreground text-xs">Rol</Label>
                <select
                  value={form.role_id ?? 1}
                  onChange={(e) => setForm({ ...form, role_id: +e.target.value })}
                  className="w-full rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2 mt-1"
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Técnico</option>
                </select>
              </div>
              <Button
                onClick={handleSave}
                disabled={createMut.isPending}
                className="w-full gradient-primary text-primary-foreground font-semibold"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear Usuario
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
                <TableHead className="text-muted-foreground">Dirección</TableHead>
                <TableHead className="text-muted-foreground">Rol</TableHead>
                <TableHead className="text-muted-foreground">DNI</TableHead>
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
                  <TableCell className="text-muted-foreground text-sm">{u.address ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      u.role_id === 1
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-warning/15 text-warning border-warning/30"
                    }`}>
                      {u.role_id === 1 ? <Shield className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                      {u.role_id === 1 ? "Administrador" : "Técnico"}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">{u.dni ?? "—"}</TableCell>
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
