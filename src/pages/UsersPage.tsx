import { users } from "@/data/mockData";
import { Users, Shield, Wrench } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">Administrar usuarios y roles del sistema</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Correo</TableHead>
              <TableHead className="text-muted-foreground">Teléfono</TableHead>
              <TableHead className="text-muted-foreground">Rol</TableHead>
              <TableHead className="text-muted-foreground">Identificación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-border hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                      {u.fullName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-medium text-foreground">{u.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.phone}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    u.role === "admin"
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-warning/15 text-warning border-warning/30"
                  }`}>
                    {u.role === "admin" ? <Shield className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                    {u.role === "admin" ? "Administrador" : "Técnico"}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-sm">{u.idNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
