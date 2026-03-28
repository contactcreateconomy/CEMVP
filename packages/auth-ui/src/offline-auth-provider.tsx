"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { AuthContextProvider, type AuthContextValue } from "./auth-context";
import type { AuthMode, LoginPayload, SignupPayload, SocialAuthProvider } from "./types";

const OFFLINE_SIGN_IN_MESSAGE =
  "Sign-in is unavailable: set NEXT_PUBLIC_CONVEX_URL (and run Convex) to enable authentication.";

export function OfflineAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authError, setAuthError] = useState<string | null>(null);

  const openAuthModal = useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const rejectSignIn = useCallback(async () => {
    setAuthError(OFFLINE_SIGN_IN_MESSAGE);
  }, []);

  const socialLogin = useCallback(async (_provider: SocialAuthProvider) => {
    setAuthError(OFFLINE_SIGN_IN_MESSAGE);
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (_payload: LoginPayload) => {
    await rejectSignIn();
  }, [rejectSignIn]);

  const signup = useCallback(async (_payload: SignupPayload) => {
    await rejectSignIn();
  }, [rejectSignIn]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authStatus: "anonymous",
      user: null,
      authEnvironmentNote: OFFLINE_SIGN_IN_MESSAGE,
      isAuthModalOpen,
      authMode,
      isSubmitting: false,
      authError,
      openAuthModal,
      closeAuthModal,
      clearAuthError,
      login,
      signup,
      socialLogin,
      logout,
    }),
    [
      isAuthModalOpen,
      authMode,
      authError,
      openAuthModal,
      closeAuthModal,
      clearAuthError,
      login,
      signup,
      socialLogin,
      logout,
    ],
  );

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>;
}
