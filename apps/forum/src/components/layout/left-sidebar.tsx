"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  GitCompare,
  HelpCircle,
  Home,
  LayoutList,
  Newspaper,
  Rocket,
  Sparkles,
  Star,
  Swords,
  type LucideIcon,
} from "lucide-react";

import { isConvexConfigured } from "@cemvp/convex-client";
import { useSharedData } from "@/providers/shared-data-context";
import type { CategoryKey } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

const categoryIconMap: Record<CategoryKey, LucideIcon> = {
  news: Newspaper,
  review: Star,
  compare: GitCompare,
  "launch-pad": Rocket,
  debate: Swords,
  help: HelpCircle,
  list: LayoutList,
  showcase: Sparkles,
  gigs: Briefcase,
};

type DiscoverItem = { key: string; label: string; href: string; Icon: LucideIcon };

function LeftSidebarShell({ discoverItems }: { discoverItems: DiscoverItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const activeKey =
    selectedCategory && discoverItems.some((item) => item.key === selectedCategory) ? selectedCategory : "home";

  return (
    <aside className="sticky top-20 hidden h-fit w-[240px] shrink-0 space-y-4 lg:block">
      <Card className="animate-soft-float overflow-hidden">
        <CardContent className="p-3">
          <div className="relative rounded-full">
            <GlowingEffect
              spread={28}
              glow
              disabled={false}
              proximity={48}
              inactiveZone={0.18}
              borderWidth={2}
              movementDuration={0.5}
            />
            <Button
              onClick={() => router.push("/new-post")}
              className="relative z-10 h-9 w-full rounded-full text-base font-semibold shadow-[0_6px_20px_rgba(14,165,233,0.2)] transition-[box-shadow] duration-300 ease-out hover:shadow-[0_8px_22px_rgba(14,165,233,0.26)]"
              style={{ color: "black" }}
            >
              + Start Discussion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-soft-float" style={{ animationDelay: "60ms" }}>
        <CardHeader>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Discover</h2>
        </CardHeader>

        <CardContent className="relative p-3 pt-0">
          <nav className="space-y-1 rounded-[14px]" aria-label="Discover categories">
            {discoverItems.map(({ key, label, href, Icon }) => {
              const isActive = key === activeKey;

              return (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    "relative flex h-10 w-full items-center gap-2.5 rounded-full border px-3 text-sm font-semibold",
                    "outline-offset-2 focus-visible:ring-2 focus-visible:ring-(--border-active) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-surface)",
                    isActive
                      ? "border-(--border-active)/75 bg-(--brand-primary)/10 text-(--brand-primary) shadow-[0_0_16px_hsl(199_89%_48%_/_0.2),0_0_0_1px_hsl(199_89%_48%_/_0.35)] transition-[color,box-shadow,border-color,background-color] duration-200 ease-out"
                      : "border-transparent text-(--text-primary) transition-colors duration-200 ease-out hover:text-(--brand-primary)",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-[transform,color] duration-200 ease-out",
                      isActive && "scale-105",
                    )}
                    strokeWidth={2.5}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

function LeftSidebarWithConvex() {
  const { categories } = useSharedData();
  const discoverItems: DiscoverItem[] = [
    { key: "home", label: "Home", href: "/feed", Icon: Home },
    ...categories.map((category) => ({
      key: category.key,
      label: category.name,
      href: `/feed?category=${category.key}`,
      Icon: categoryIconMap[category.key as CategoryKey] ?? LayoutList,
    })),
  ];
  return <LeftSidebarShell discoverItems={discoverItems} />;
}

/** When Convex URL is missing, show Home only — do not call `useQuery` without a ConvexProvider. */
export function LeftSidebar() {
  if (!isConvexConfigured()) {
    return <LeftSidebarShell discoverItems={[{ key: "home", label: "Home", href: "/feed", Icon: Home }]} />;
  }
  return <LeftSidebarWithConvex />;
}
