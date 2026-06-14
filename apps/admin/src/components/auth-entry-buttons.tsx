"use client";

import { useAuth } from "@cemvp/auth-ui";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthEntryButtonsProps {
  showSignup?: boolean;
  fullWidth?: boolean;
}

export function AuthEntryButtons({ showSignup = false, fullWidth = false }: AuthEntryButtonsProps) {
  const { openAuthModal } = useAuth();

  return (
    <div className={cn("flex flex-wrap gap-2", fullWidth && "w-full flex-col")}>
      <Button
        type="button"
        size={fullWidth ? "lg" : "md"}
        className={cn(fullWidth && "w-full")}
        onClick={() => openAuthModal("login")}
      >
        Log in
      </Button>
      {showSignup ? (
        <Button
          type="button"
          variant="secondary"
          size={fullWidth ? "lg" : "md"}
          className={cn(fullWidth && "w-full")}
          onClick={() => openAuthModal("signup")}
        >
          Sign up
        </Button>
      ) : null}
    </div>
  );
}
