"use client";

import { useAuth } from "@cemvp/auth-ui";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, logout, authStatus } = useAuth();

  if (authStatus !== "authenticated" || !user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9 border border-[var(--border-subtle)]">
        {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
        <AvatarFallback className="bg-[var(--bg-surface-elevated)] text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => void logout()}>
        Sign out
      </Button>
    </div>
  );
}
