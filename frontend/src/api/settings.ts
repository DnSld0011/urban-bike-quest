import { apiRequest } from "./client";

export interface SettingOut {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

export interface SettingCreate {
  key: string;
  value: string;
  description?: string;
}

export interface SettingUpdate {
  value: string;
}

export const getSettings = () =>
  apiRequest<SettingOut[]>("/settings");

export const createSetting = (data: SettingCreate) =>
  apiRequest<SettingOut>("/settings", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSetting = (key: string, data: SettingUpdate) =>
  apiRequest<SettingOut>(`/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
