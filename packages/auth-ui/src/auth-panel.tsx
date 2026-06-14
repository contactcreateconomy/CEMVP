"use client";

import { useState } from "react";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { SocialLoginButtons } from "./social-login-buttons";
import { cn } from "./utils/cn";
import { useAppAuth } from "./app-auth-provider";

export interface AuthPanelProps {
  className?: string;
  loginTitle?: string;
  loginDescription?: string;
  signupTitle?: string;
  signupDescription?: string;
  defaultMode?: "login" | "signup";
  showSignupTab?: boolean;
  showSocialLogin?: boolean;
}

export function AuthPanel({
  className,
  loginTitle = "Welcome back",
  loginDescription = "Log in to continue building your creator momentum.",
  signupTitle = "Create your account",
  signupDescription = "Join Createconomy and launch your creator stack.",
  defaultMode = "login",
  showSignupTab = true,
  showSocialLogin = true,
}: AuthPanelProps) {
  const {
    isSubmitting,
    authError,
    authEnvironmentNote,
    clearAuthError,
    login,
    signup,
    socialLogin,
  } = useAppAuth();

  const [authMode, setAuthMode] = useState<"login" | "signup">(defaultMode);

  const title = authMode === "login" ? loginTitle : signupTitle;
  const description = authMode === "login" ? loginDescription : signupDescription;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[20px] border border-white/10 bg-(--bg-surface)/92 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_32px_80px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="relative px-7 pt-6 pb-7 sm:px-8">
        {authEnvironmentNote ? (
          <div
            role="status"
            className="mb-4 rounded-[12px] border border-feedback-warning/40 bg-feedback-warning/10 px-3 py-2.5 text-left text-sm text-text-primary"
          >
            {authEnvironmentNote}
          </div>
        ) : null}

        <div className="mb-5 text-center">
          <h1 className="text-[28px] font-semibold leading-tight text-text-primary sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
        </div>

        {showSignupTab ? (
          <div className="relative mx-auto w-full rounded-[14px] border border-border-default/80 bg-bg-overlay/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div
              className="pointer-events-none absolute bottom-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-[11px] bg-brand-primary shadow-[0_8px_24px_rgba(14,165,233,0.24)] transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${authMode === "signup" ? "100%" : "0%"})` }}
            />

            <div className="relative z-10 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                className={cn(
                  "rounded-[11px] px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200",
                  authMode === "login" ? "text-white" : "text-text-secondary hover:text-text-primary",
                )}
                onClick={() => {
                  clearAuthError();
                  setAuthMode("login");
                }}
                disabled={isSubmitting}
              >
                Login
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-[11px] px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200",
                  authMode === "signup" ? "text-white" : "text-text-secondary hover:text-text-primary",
                )}
                onClick={() => {
                  clearAuthError();
                  setAuthMode("signup");
                }}
                disabled={isSubmitting}
              >
                Sign up
              </button>
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "mx-auto w-3/4 px-1 pb-1 transition-transform duration-300 ease-out",
            showSignupTab ? "mt-4" : "mt-0",
            authMode === "signup" ? "scale-[1.02]" : "scale-100",
          )}
        >
          {authMode === "login" || !showSignupTab ? (
            <LoginForm
              isSubmitting={isSubmitting}
              authError={authError}
              onSubmit={login}
              onSwitchToSignup={
                showSignupTab
                  ? () => {
                      clearAuthError();
                      setAuthMode("signup");
                    }
                  : () => {}
              }
            />
          ) : (
            <SignupForm
              isSubmitting={isSubmitting}
              authError={authError}
              onSubmit={signup}
              onSwitchToLogin={() => {
                clearAuthError();
                setAuthMode("login");
              }}
            />
          )}
        </div>

        {showSocialLogin ? (
          <>
            <div className="mx-auto my-4 flex w-3/4 items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-text-muted">
              <span className="h-px flex-1 bg-border-subtle" />
              <span>or continue with</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>

            <SocialLoginButtons isSubmitting={isSubmitting} onSocialLogin={socialLogin} />
          </>
        ) : null}
      </div>
    </div>
  );
}
