import { apiRequest } from "./client";

export interface RolePermissionOut {
  id: number;
  module: string;
  can_view: boolean;
  can_edit: boolean;
}

export interface RolePermissionSet {
  module: string;
  can_view: boolean;
  can_edit: boolean;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  permissions: RolePermissionOut[];
}

export interface RoleCreate {
  name: string;
}

export const ALL_MODULES = [
  { key: "bikes",       label: "Bicicletas" },
  { key: "stations",    label: "Estaciones" },
  { key: "users",       label: "Usuarios" },
  { key: "trips",       label: "Viajes" },
  { key: "maintenance", label: "Mantenimiento" },
  { key: "alerts",      label: "Alertas" },
  { key: "settings",    label: "Configuración" },
];

export const getRoles = () =>
  apiRequest<RoleWithPermissions[]>("/roles", { auth: true });

export const getRole = (id: number) =>
  apiRequest<RoleWithPermissions>(`/roles/${id}`, { auth: true });

export const createRole = (data: RoleCreate) =>
  apiRequest<RoleWithPermissions>("/roles", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });

export const setRolePermissions = (id: number, permissions: RolePermissionSet[]) =>
  apiRequest<RoleWithPermissions>(`/roles/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify(permissions),
    auth: true,
  });

export const deleteRole = (id: number) =>
  apiRequest<{ message: string }>(`/roles/${id}`, {
    method: "DELETE",
    auth: true,
  });
