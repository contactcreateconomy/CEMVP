"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/convex";
import { AuthPanel, useAuth } from "@cemvp/auth-ui";
import { isConvexConfigured } from "@cemvp/convex-client";

/** Production admin host — OAuth and sign-in are enabled here only. */
const PROD_ADMIN_HOST = "console.createconomy.com";

function useIsProdAdminHost() {
  const [isProdAdmin, setIsProdAdmin] = useState(false);

  useEffect(() => {
    setIsProdAdmin(window.location.hostname === PROD_ADMIN_HOST);
  }, []);

  return isProdAdmin;
}

function AccessDeniedPanel() {
  const { logout } = useAuth();

  return (
    <Card className="w-full max-w-[560px] border-[var(--border-default)] bg-[var(--bg-surface)]">
      <CardContent className="space-y-4 p-6 text-center">
        <h1 className="text-lg font-semibold">Access restricted</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          This workspace is limited to authorized app owners. If you manage Createconomy, ask the operator to add
          your sign-in email to <code className="font-mono text-xs">ADMIN_EMAILS</code> on the production Convex
          deployment, then sign out and sign in again.
        </p>
        <Button variant="secondary" className="w-full" onClick={() => void logout()}>
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}

function NonProdPanel() {
  return (
    <Card className="w-full max-w-md border-[var(--border-default)] bg-[var(--bg-surface)]">
      <CardContent className="space-y-3 p-6 text-center">
        <h1 className="text-lg font-semibold">Production only</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Admin sign-in is available at{" "}
          <a href="https://console.createconomy.com" className="font-medium text-brand-primary hover:underline">
            console.createconomy.com
          </a>{" "}
          in production. Local and dev deployments do not offer sign-in here.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingPanel() {
  return (
    <div className="w-full max-w-[560px] space-y-4">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="h-[420px] w-full rounded-[20px]" />
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const isProdAdmin = useIsProdAdminHost();
  const convexConfigured = isConvexConfigured();
  const { authStatus } = useAuth();
  const isAdmin = useQuery(
    api.forum.personas.queries.isPersonaAdmin,
    convexConfigured && authStatus === "authenticated" && isProdAdmin ? {} : "skip",
  );

  useEffect(() => {
    if (isAdmin === true) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  return (
    <div className="canvas-dot-grid flex min-h-screen items-center justify-center px-4 py-10">
      {!convexConfigured ? (
        <Card className="w-full max-w-md border-[var(--border-default)]">
          <CardContent className="p-6 text-sm text-[var(--text-secondary)]">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
            <code className="font-mono text-xs">apps/admin/.env.local</code>.
          </CardContent>
        </Card>
      ) : !isProdAdmin ? (
        <NonProdPanel />
      ) : authStatus === "loading" || (authStatus === "authenticated" && isAdmin === undefined) ? (
        <LoadingPanel />
      ) : authStatus === "authenticated" && isAdmin === false ? (
        <AccessDeniedPanel />
      ) : (
        <AuthPanel
          className="w-full max-w-[560px] animate-route-emerge"
          loginDescription="Sign in with your owner account to continue."
          signupDescription="Create an owner account if you have been invited."
          showSocialLogin
        />
      )}
    </div>
  );
}
