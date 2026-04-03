"use client";

import { useQuery } from "convex/react";
import { Settings } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";

export function SettingsPageClient() {
  const enabled = isConvexConfigured();
  const settings = useQuery(api.forum.queries.getViewerSettings, enabled ? {} : "skip");

  if (!enabled) {
    return (
      <p className="text-sm text-(--text-muted)">
        Connect Convex to load settings.
      </p>
    );
  }

  if (settings === undefined) {
    return null;
  }

  return (
    <section className="animate-route-emerge space-y-4">
      <Card>
        <CardHeader>
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-(--text-primary)">
            <Settings className="h-5 w-5" /> Settings
          </h1>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-md border border-(--border-default) bg-(--bg-surface) p-3">
            <p className="text-sm font-semibold text-(--text-primary)">Theme</p>
            <p className="mt-1 text-xs text-(--text-muted)">Current: {settings.theme}</p>
          </div>

          <div className="rounded-md border border-(--border-default) bg-(--bg-surface) p-3 text-xs text-(--text-secondary)">
            <p>Email notifications: {settings.emailNotifications ? "Enabled" : "Disabled"}</p>
            <p className="mt-1">Push notifications: {settings.pushNotifications ? "Enabled" : "Disabled"}</p>
            <p className="mt-1">Hide mature content: {settings.hideMatureContent ? "Enabled" : "Disabled"}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
