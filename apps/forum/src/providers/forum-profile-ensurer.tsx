"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

import { api } from "@/lib/convex";
import { useAuth } from "@cemvp/auth-ui";

/** Ensures `forumProfiles` exists for authenticated users (legacy signups before hook). */
export function ForumProfileEnsurer() {
  const { authStatus } = useAuth();
  const ensure = useMutation(api.forum.mutations.ensureForumProfile);
  const ranForSession = useRef(false);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      ranForSession.current = false;
      return;
    }
    if (ranForSession.current) {
      return;
    }
    ranForSession.current = true;
    void ensure({}).catch(() => {
      ranForSession.current = false;
    });
  }, [authStatus, ensure]);

  return null;
}
