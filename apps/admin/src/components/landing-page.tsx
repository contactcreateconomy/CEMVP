"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useQuery } from "convex/react";

import { CreateconomyLogoMark } from "@/components/createconomy-logo-mark";
import { AuthEntryButtons } from "@/components/auth-entry-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/convex";
import { useAuth } from "@cemvp/auth-ui";
import { isConvexConfigured } from "@cemvp/convex-client";

function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="canvas-dot-grid flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <CreateconomyLogoMark size={36} separatorColor="var(--bg-canvas)" />
          <div>
            <p className="text-sm font-medium tracking-tight text-[var(--text-primary)]">Createconomy</p>
            <p className="text-xs text-[var(--text-muted)]">Admin</p>
          </div>
        </div>

        {children}

        <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
          Restricted to authorized app owners.
        </p>
      </div>
    </div>
  );
}

function LandingPanel({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <Card className="border-[var(--border-default)] bg-[var(--bg-surface)]">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
          {description ? <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p> : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function AccessDeniedPanel() {
  const { logout } = useAuth();

  return (
    <LandingPanel
      title="Access restricted"
      description="Your account does not have permission to use this workspace."
    >
      <Button variant="secondary" className="w-full" onClick={() => void logout()}>
        Sign out
      </Button>
    </LandingPanel>
  );
}

function LoadingPanel() {
  return (
    <Card className="border-[var(--border-default)] bg-[var(--bg-surface)]">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export function LandingPage() {
  const router = useRouter();
  const convexConfigured = isConvexConfigured();
  const { authStatus } = useAuth();
  const isAdmin = useQuery(
    api.forum.personas.queries.isPersonaAdmin,
    convexConfigured && authStatus === "authenticated" ? {} : "skip",
  );

  useEffect(() => {
    if (isAdmin === true) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  return (
    <LandingShell>
      {!convexConfigured ? (
        <LandingPanel
          title="Not configured"
          description="Set NEXT_PUBLIC_CONVEX_URL in apps/admin/.env.local to continue."
        />
      ) : authStatus === "loading" || (authStatus === "authenticated" && isAdmin === undefined) ? (
        <LoadingPanel />
      ) : authStatus === "authenticated" && isAdmin === false ? (
        <AccessDeniedPanel />
      ) : (
        <LandingPanel title="Sign in" description="Use your owner account to continue.">
          <AuthEntryButtons fullWidth />
        </LandingPanel>
      )}
    </LandingShell>
  );
}
