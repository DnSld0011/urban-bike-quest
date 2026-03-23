import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center justify-center text-center">
        <Settings className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-card-foreground">Settings Coming Soon</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          System configuration, notification preferences, and API settings will be available here once the backend is connected.
        </p>
      </div>
    </div>
  );
}
