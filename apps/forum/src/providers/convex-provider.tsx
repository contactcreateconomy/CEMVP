"use client";

import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

import { getConvexUrl } from "@cemvp/convex-client";

let client: ConvexReactClient | null = null;

export function ConvexProvider({ children }: { children: ReactNode }) {
  const convexUrl = getConvexUrl();

  if (!convexUrl) {
    return <>{children}</>;
  }

  if (!client) {
    client = new ConvexReactClient(convexUrl);
  }

  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}
