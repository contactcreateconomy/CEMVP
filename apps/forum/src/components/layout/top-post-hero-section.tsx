"use client";

import { useQuery } from "convex/react";

import { TopPostHeroCarousel } from "@/components/feed/top-post-hero-carousel";
import { api } from "@/lib/convex";
import type { TopPostHeroSlide } from "@/types/hero";
import { isConvexConfigured } from "@cemvp/convex-client";

export function TopPostHeroSection() {
  const enabled = isConvexConfigured();
  const slides = useQuery(api.forum.queries.listHeroSlides, enabled ? {} : "skip");

  if (!enabled || slides === undefined || slides.length === 0) {
    return null;
  }

  return <TopPostHeroCarousel slides={slides as TopPostHeroSlide[]} className="h-[380px] xl:h-[420px]" />;
}
