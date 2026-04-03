"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Bell } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/convex";
import { formatRelativeDate } from "@/lib/format";
import { isConvexConfigured } from "@cemvp/convex-client";
import { useAuth } from "@cemvp/auth-ui";

export function NotificationsPageClient() {
  const { authStatus, openAuthModal } = useAuth();
  const enabled = isConvexConfigured();
  const viewerNotifications = useQuery(
    api.forum.queries.listNotificationsForViewer,
    enabled && authStatus === "authenticated" ? {} : "skip",
  );

  if (!enabled) {
    return <p className="text-sm text-(--text-muted)">Connect Convex to load notifications.</p>;
  }

  if (authStatus !== "authenticated") {
    return (
      <section className="animate-route-emerge space-y-4">
        <Card>
          <CardHeader>
            <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-(--text-primary)">
              <Bell className="h-5 w-5" /> Notifications
            </h1>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="text-sm text-(--brand-primary) underline-offset-2 hover:underline"
            >
              Sign in
            </button>
            <span className="text-sm text-(--text-secondary)"> to see your notifications.</span>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (viewerNotifications === undefined) {
    return null;
  }

  return (
    <section className="animate-route-emerge space-y-4">
      <Card>
        <CardHeader>
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-(--text-primary)">
            <Bell className="h-5 w-5" /> Notifications
          </h1>
        </CardHeader>

        <CardContent className="space-y-2">
          {viewerNotifications.map((notification) => {
            const wrapperClass = notification.read
              ? "rounded-md border border-(--border-default) bg-(--bg-surface) p-3"
              : "rounded-md border border-(--border-active) bg-(--bg-overlay) p-3";

            const content = (
              <>
                <p className="text-sm font-semibold text-(--text-primary)">{notification.title}</p>
                <p className="mt-1 text-xs text-(--text-secondary)">{notification.message}</p>
                <p className="mt-2 text-[11px] text-(--text-muted)">{formatRelativeDate(notification.createdAt)}</p>
              </>
            );

            if (!notification.postSlug) {
              return (
                <div key={notification.id} className={wrapperClass}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={notification.id} href={`/discussions/${notification.postSlug}`} className={`${wrapperClass} block`}>
                {content}
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
