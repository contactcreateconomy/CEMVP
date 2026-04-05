"use client";

import { useQuery } from "convex/react";

import { PodiumWidget } from "@/components/layout/podium-widget";
import { WhatsVibingWidget } from "@/components/layout/whats-vibing-widget";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";

function RightSidebarWithConvex() {
  const rows = useQuery(api.forum.queries.getLeaderboardWithUsers, {}) ?? [];

  return (
    <aside className="sticky top-20 hidden h-fit w-[320px] shrink-0 space-y-4 xl:block">
      <WhatsVibingWidget />

      <Card className="animate-soft-float" style={{ animationDelay: "100ms" }}>
        <CardContent className="p-3">
          <PodiumWidget rows={rows} />
        </CardContent>
      </Card>
    </aside>
  );
}

/** Omit sidebar widgets entirely when Convex is not configured (build-time prerender). */
export function RightSidebar() {
  if (!isConvexConfigured()) {
    return null;
  }
  return <RightSidebarWithConvex />;
}
