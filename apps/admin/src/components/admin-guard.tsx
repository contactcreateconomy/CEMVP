"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AdminShell } from "@/components/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";

function ConsoleLoadingShell() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </AdminShell>
  );
}

function AdminGuardWithConvex({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAdmin = useQuery(api.forum.personas.queries.isPersonaAdmin, {});

  useEffect(() => {
    if (isAdmin === false) {
      router.replace("/");
    }
  }, [isAdmin, router]);

  if (isAdmin === undefined) {
    return <ConsoleLoadingShell />;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isConvexConfigured()) {
      router.replace("/");
    }
  }, [router]);

  if (!isConvexConfigured()) {
    return null;
  }

  return <AdminGuardWithConvex>{children}</AdminGuardWithConvex>;
}
