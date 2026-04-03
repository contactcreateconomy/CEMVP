export interface TopPostHeroSlide {
  id: string;
  slug: string;
  /** Full path for featured links, including `?post=` when overlaying feed copy on an MVP thread. */
  discussionHref: string;
  title: string;
  summary: string;
  coverImage?: string;
  reads: number;
  comments: number;
  shares: number;
  eyebrow: string;
  ctaLabel: string;
  accentRgb: `${number} ${number} ${number}`;
}
