"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  FileText,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { CreateconomyLogoMark } from "@/components/createconomy-logo-mark";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/topics", label: "Topics", icon: FileText },
  { href: "/posts", label: "Posts", icon: MessageSquare },
  { href: "/moderation", label: "Moderation", icon: Inbox },
  { href: "/safety", label: "Safety", icon: Shield },
  { href: "/queue", label: "Review queue", icon: Inbox },
  { href: "/runs", label: "Runs", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-4 py-4">
          <CreateconomyLogoMark size={24} separatorColor="var(--bg-surface)" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Createconomy</p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">Admin console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors no-underline",
                  active
                    ? "bg-[var(--brand-primary)]/12 text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-[var(--brand-primary)]")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <UserMenu />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="canvas-dot-grid flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 animate-route-emerge">{children}</div>
        </main>
      </div>
    </div>
  );
}
