"use client";

import { useQuery } from "convex/react";

import { TopPostHeroCarousel } from "@/components/feed/top-post-hero-carousel";
import { api } from "@/lib/convex";
import type { TopPostHeroSlide } from "@/types/hero";
import { isConvexConfigured } from "@cemvp/convex-client";

function TopPostHeroSectionWithConvex() {
  const slides = useQuery(api.forum.queries.listHeroSlides, {});

  if (slides === undefined || slides.length === 0) {
    return null;
  }

  return <TopPostHeroCarousel slides={slides as TopPostHeroSlide[]} className="h-[380px] xl:h-[420px]" />;
}

/** Avoid `useQuery` when Convex is not configured (e.g. Vercel build without `NEXT_PUBLIC_CONVEX_URL`) — `useQuery` still requires a provider even with `"skip"`. */
export function TopPostHeroSection() {
  if (!isConvexConfigured()) {
    return null;
  }
  return <TopPostHeroSectionWithConvex />;
}
