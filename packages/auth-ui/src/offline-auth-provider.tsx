"use client";

import { useMemo, type ReactNode } from "react";

import { AuthContextProvider, type AuthContextValue } from "./auth-context";

export function OfflineAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      authStatus: "anonymous",
      user: null,
      isAuthModalOpen: false,
      authMode: "login",
      isSubmitting: false,
      authError: null,
      openAuthModal: () => {},
      closeAuthModal: () => {},
      clearAuthError: () => {},
      login: async () => {},
      signup: async () => {},
      socialLogin: async () => {},
      logout: async () => {},
    }),
    [],
  );

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>;
}
