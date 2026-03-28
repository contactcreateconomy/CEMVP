"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, X } from "lucide-react";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { SocialLoginButtons } from "./social-login-buttons";
import { cn } from "./utils/cn";
import { useAppAuth } from "./app-auth-provider";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authMode,
    isSubmitting,
    authError,
    authEnvironmentNote,
    openAuthModal,
    closeAuthModal,
    clearAuthError,
    login,
    signup,
    socialLogin,
  } = useAppAuth();

  return (
    <Dialog.Root open={isAuthModalOpen} onOpenChange={(open) => (open ? openAuthModal(authMode) : closeAuthModal())}>
      <Dialog.Portal>
        {/*
          Flex-center the panel instead of fixed + translate utilities. Tailwind v4 can emit the
          `translate` property separately from `transform`, which fights our modal keyframes and
          can leave the dialog at the static position (top-left).
        */}
        <div className="auth-modal-portal-root fixed inset-0 z-70 flex items-center justify-center p-[min(1.25rem,4vw)]">
          <Dialog.Overlay className="auth-modal-overlay absolute inset-0 bg-bg-canvas/68 backdrop-blur-md" />

          <Dialog.Content
            className={cn(
              "auth-modal-content relative z-10 w-[min(520px,94vw)] overflow-hidden rounded-[20px] border border-border-default bg-bg-surface shadow-lg outline-hidden",
              "origin-center",
            )}
          >
          <div className="absolute inset-x-0 top-0 h-px bg-brand-primary/70" />

          <div className="relative p-5 sm:p-6">
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-5 top-5 rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-overlay hover:text-text-primary"
                aria-label="Close authentication dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>

            {authEnvironmentNote ? (
              <div
                role="status"
                className="mb-4 rounded-[12px] border border-feedback-warning/40 bg-feedback-warning/10 px-3 py-2.5 text-left text-sm text-text-primary"
              >
                {authEnvironmentNote}
              </div>
            ) : null}

            <div className="mb-5 text-center">
              <Dialog.Title className="text-[28px] font-semibold leading-tight text-text-primary sm:text-3xl">
                {authMode === "login" ? "Welcome back" : "Create your account"}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-text-secondary">
                {authMode === "login"
                  ? "Log in to continue building your creator momentum."
                  : "Join Createconomy and launch your creator stack."}
              </Dialog.Description>
            </div>

            <div className="relative rounded-[12px] bg-bg-overlay p-1">
              <div
                className="pointer-events-none absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-[10px] bg-brand-primary shadow-[0_8px_24px_rgba(14,165,233,0.24)] transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${authMode === "signup" ? "100%" : "0%"})` }}
              />

              <div className="relative z-10 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-xs font-semibold transition-colors duration-200",
                    authMode === "login" ? "text-white" : "text-text-secondary hover:text-text-primary",
                  )}
                  onClick={() => {
                    clearAuthError();
                    openAuthModal("login");
                  }}
                  disabled={isSubmitting}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-xs font-semibold transition-colors duration-200",
                    authMode === "signup" ? "text-white" : "text-text-secondary hover:text-text-primary",
                  )}
                  onClick={() => {
                    clearAuthError();
                    openAuthModal("signup");
                  }}
                  disabled={isSubmitting}
                >
                  Sign up
                </button>
              </div>
            </div>

            <div
              className={cn(
                "mt-4 px-2 pb-1 transition-transform duration-300 ease-out",
                authMode === "signup" ? "scale-[1.02]" : "scale-100",
              )}
            >
              {authMode === "login" ? (
                <LoginForm
                  isSubmitting={isSubmitting}
                  authError={authError}
                  onSubmit={login}
                  onSwitchToSignup={() => {
                    clearAuthError();
                    openAuthModal("signup");
                  }}
                />
              ) : (
                <SignupForm
                  isSubmitting={isSubmitting}
                  authError={authError}
                  onSubmit={signup}
                  onSwitchToLogin={() => {
                    clearAuthError();
                    openAuthModal("login");
                  }}
                />
              )}
            </div>

            <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-text-muted">
              <span className="h-px flex-1 bg-border-subtle" />
              <span>or continue with</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>

            <SocialLoginButtons isSubmitting={isSubmitting} onSocialLogin={socialLogin} />

            <div className="mt-4 rounded-[12px] border border-border-subtle bg-bg-overlay px-3 py-2 text-[11px] text-text-secondary">
              <p className="inline-flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-brand-primary" />
                Email and password use Convex Auth. OAuth buttons are not wired yet.
              </p>
            </div>

            <div className="sr-only" aria-live="polite">
              {isSubmitting ? "Processing authentication request" : authError ? authError : "Authentication form ready"}
            </div>
          </div>
        </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
