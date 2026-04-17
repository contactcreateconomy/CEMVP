"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { ChevronLeft, ChevronRight, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";

import type { TopPostHeroSlide } from "@/types/hero";
import { cn } from "@/lib/utils";

// ─── Physics ──────────────────────────────────────────────────────────────────
const BASE_SPRING     = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const;
const TAP_SPRING      = { type: "spring", stiffness: 450, damping: 18, mass: 1 } as const;
const COLLAPSE_SPRING = { type: "spring", stiffness: 200, damping: 28, mass: 1.2 } as const;

// ─── Swipe ────────────────────────────────────────────────────────────────────
const SWIPE_CONFIDENCE = 8000;

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

// ─── Wheel debounce ───────────────────────────────────────────────────────────
const WHEEL_LOCKOUT_MS = 400;
const WHEEL_THRESHOLD  = 20;

// ─── Card geometry (default 3D cascade) ───────────────────────────────────────
const X_STRIDE     = 440;
const Z_STRIDE     = 160;
const ROTATE_Y_DEG = 12;
const SIDE_COUNT   = 2;
const TOP_PAD      = 16;
const BOTTOM_PAD   = 20;
const RIGHT_PAD    = 28;

// ─── Compact mode height ──────────────────────────────────────────────────────
// Compact uses CSS flex expansion — no framer-motion card geometry needed.
const COMPACT_H = 268;

// ─── Layout (measured dynamically to match sorter width) ──────────────────────
interface Layout {
  cardW:  number;
  cardH:  number;
  focusX: number;
}

function defaultLayout(): Layout {
  const cardW = 549;
  return { cardW, cardH: Math.round(cardW * 0.5), focusX: -40 };
}

// ─── Per-card transform — 3D cascade (default state only) ────────────────────
function cardTransform(offset: number, focusX: number) {
  const dist       = Math.abs(offset);
  const scale      = dist === 0 ? 1    : dist === 1 ? 0.5  : 0.35;
  const opacity    = dist === 0 ? 1    : dist === 1 ? 0.55 : 0.14;
  const blur       = dist === 0 ? 0    : dist === 1 ? 8    : 16;
  const brightness = dist === 0 ? 1    : dist === 1 ? 0.45 : 0.2;
  return {
    x:       focusX - offset * X_STRIDE,
    z:       -dist  * Z_STRIDE,
    rotateY:  offset * ROTATE_Y_DEG,
    scale,
    opacity,
    blur,
    brightness,
  };
}

// ─── State machine ────────────────────────────────────────────────────────────
// default  → full-height 3D cinematic cascade (unchanged)
// compact  → flat CSS-flex expanding-cards strip (~268px)
// Toggle:  default ↔ compact via handles at bottom-centre of each state.
// On page load/refresh: always starts as 'default'.
type CarouselState = "default" | "compact";

interface TopPostHeroCarouselProps {
  slides: TopPostHeroSlide[];
  className?: string;
}

export function TopPostHeroCarousel({ slides, className }: TopPostHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused]       = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [layout, setLayout]           = useState<Layout>(defaultLayout);
  const [mounted, setMounted]         = useState(false);
  const [carouselState, setCarouselState] = useState<CarouselState>("default");
  const heroRef      = useRef<HTMLDivElement>(null);
  const wheelLocked  = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme }    = useTheme();
  const isDark  = mounted ? resolvedTheme === "dark" : true;
  const count   = slides.length;

  // ── Responsive default height ─────────────────────────────────────────────
  // Lazy initializer sets correct value before first paint → no 440→520 spring on xl mounts.
  const [defaultH, setDefaultH] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches ? 520 : 440
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    function onChange(e: MediaQueryListEvent) { setDefaultH(e.matches ? 520 : 440); }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const targetHeight = carouselState === "default" ? defaultH : COMPACT_H;

  // ── Measure sorter width → derive cardW and cardH ────────────────────────
  useEffect(() => {
    function measure() {
      const sorterEl = document.querySelector<HTMLElement>('.grid.grid-cols-4');
      if (!sorterEl) return;
      const heroRect   = heroRef.current!.getBoundingClientRect();
      const sorterRect = sorterEl.getBoundingClientRect();
      const cardW   = sorterRect.width;
      const cardH   = Math.round(cardW * 0.5);
      const focusX  = (sorterRect.left + cardW / 2) - (heroRect.left + heroRect.width / 2);
      setLayout({ cardW, cardH, focusX });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  // ── Auto-advance — runs in both states ───────────────────────────────────
  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, 5200);
    return () => window.clearInterval(id);
  }, [isPaused, count]);

  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % count), [count]);
  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + count) % count), [count]);

  // ── Mouse wheel — default state only ─────────────────────────────────────
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLocked.current) return;
      if (Math.abs(e.deltaX) < WHEEL_THRESHOLD && Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta > 0) goNext(); else goPrev();
      wheelLocked.current = true;
      setTimeout(() => { wheelLocked.current = false; }, WHEEL_LOCKOUT_MS);
    },
    [goNext, goPrev],
  );

  // ── Drag / swipe — default state only ────────────────────────────────────
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const power = swipePower(info.offset.x, info.velocity.x);
      if (power < -SWIPE_CONFIDENCE) goNext();
      else if (power > SWIPE_CONFIDENCE) goPrev();
    },
    [goNext, goPrev],
  );

  if (count === 0) return null;

  const active = slides[activeIndex];
  const { cardW, cardH, focusX } = layout;

  const visibleOffsets = Array.from(
    { length: SIDE_COUNT * 2 + 1 },
    (_, i) => i - SIDE_COUNT,
  );

  return (
    <motion.div
      ref={heroRef as React.Ref<HTMLDivElement>}
      style={{ height: defaultH }}
      animate={{ height: targetHeight }}
      transition={prefersReducedMotion ? { duration: 0 } : COLLAPSE_SPRING}
      className={cn(
        "group/hero relative overflow-hidden rounded-[28px] bg-(--bg-surface) select-none",
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      // Wheel only active in default state — compact uses click-to-expand
      onWheel={carouselState === "default" ? handleWheel : undefined}
      aria-roledescription="carousel"
      aria-label="Featured posts carousel"
    >
      <AnimatePresence mode="wait" initial={false}>

        {/* ══════════════════════════════════════════════════════════════════════
            STATE: DEFAULT — 3D cinematic cascade (visually unchanged)
            ══════════════════════════════════════════════════════════════════════ */}
        {carouselState === "default" && (
          <motion.div
            key="default"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {/* ── Ambient background ── */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.15 : 0.6 }}
                >
                  {active.coverImage && !imageErrors[active.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={active.coverImage}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-cover scale-110"
                      style={{ filter: "blur(72px) saturate(1.5)", opacity: 0.55 }}
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `radial-gradient(ellipse 120% 75% at 50% 35%,
                          rgba(${active.accentRgb}, 0.38) 0%,
                          rgba(${active.accentRgb}, 0.14) 45%,
                          transparent 72%)`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--bg-surface) 0%, color-mix(in srgb, var(--bg-surface) 50%, transparent) 28%, transparent 58%), " +
                        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 38%, color-mix(in srgb, var(--bg-surface) 80%, transparent) 100%)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── 3D Stage — symmetric cascade, edge-fades both sides ── */}
            <div
              className="absolute inset-x-0 z-10 flex items-center justify-center"
              style={{
                top:               TOP_PAD,
                bottom:            BOTTOM_PAD,
                perspective:       "1200px",
                perspectiveOrigin: "50% 50%",
                maskImage:         "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                WebkitMaskImage:   "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
              }}
            >
              {/* Drag layer */}
              <motion.div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={handleDragEnd}
              />

              {visibleOffsets.map((offset) => {
                const dist       = Math.abs(offset);
                const slideIndex = (activeIndex + offset + count) % count;
                const slide      = slides[slideIndex];
                const t          = cardTransform(offset, focusX);
                const isCenter   = offset === 0;

                return (
                  <motion.div
                    key={slide.id}
                    className="absolute"
                    style={{
                      transformStyle: "preserve-3d",
                      zIndex: isCenter ? 20 : 10 - dist,
                    }}
                    initial={{ opacity: 0 }}
                    animate={prefersReducedMotion
                      ? { x: t.x, opacity: t.opacity }
                      : { x: t.x, z: t.z, rotateY: t.rotateY, scale: t.scale, opacity: t.opacity }}
                    transition={BASE_SPRING}
                    whileTap={isCenter ? { scale: 0.97, transition: TAP_SPRING } : undefined}
                  >
                    <motion.div
                      animate={{
                        filter: prefersReducedMotion
                          ? "none"
                          : `blur(${t.blur}px) brightness(${t.brightness})`,
                      }}
                      transition={BASE_SPRING}
                      style={{
                        width:        cardW,
                        height:       cardH,
                        borderRadius: 20,
                        overflow:     "hidden",
                        position:     "relative",
                        boxShadow:    isCenter
                          ? `0 32px 80px rgba(${active.accentRgb}, 0.55), 0 12px 36px rgba(0,0,0,0.8)`
                          : "0 8px 24px rgba(0,0,0,0.4)",
                        border:        "1px solid transparent",
                        pointerEvents: isCenter ? "auto" : "none",
                      }}
                    >
                      {slide.coverImage && !imageErrors[slide.id] ? (
                        <Image
                          src={slide.coverImage}
                          alt={isCenter ? slide.title : ""}
                          fill
                          sizes="(min-width: 1280px) 549px, 90vw"
                          className="object-cover"
                          priority={isCenter && activeIndex === 0}
                          onError={() => setImageErrors((prev) => ({ ...prev, [slide.id]: true }))}
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{ background: "linear-gradient(135deg, var(--bg-surface), var(--bg-overlay))" }}
                        />
                      )}

                      {/* Cinematic lower-third gradient */}
                      {isCenter && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: isDark
                              ? "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.80) 15%, rgba(0,0,0,0.62) 28%, rgba(0,0,0,0.32) 42%, rgba(0,0,0,0.08) 56%, transparent 68%)"
                              : "linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 15%, rgba(255,255,255,0.52) 28%, rgba(255,255,255,0.22) 42%, rgba(255,255,255,0.05) 56%, transparent 68%)",
                          }}
                        />
                      )}

                      {/* Eyebrow + title overlay */}
                      {isCenter && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`overlay-${activeIndex}`}
                            className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pt-10"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--brand-primary) mb-1">
                              {active.eyebrow}
                            </p>
                            <h2 className="text-xl font-bold leading-snug text-(--text-primary) line-clamp-2 drop-shadow-sm">
                              {active.title}
                            </h2>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {/* Click target */}
                      {isCenter && (
                        <Link
                          href={slide.discussionHref}
                          aria-label={`Open: ${slide.title}`}
                          className="absolute inset-0 z-20"
                          tabIndex={0}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Nav + Explore — static, bottom-right ── */}
            <div
              className="absolute z-30 flex items-center gap-2.5"
              style={{ right: RIGHT_PAD, bottom: BOTTOM_PAD + 4 }}
            >
              <div
                className="flex items-center gap-0.5 rounded-full border border-(--border-default) px-1 py-1"
                style={{ background: isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)" }}
              >
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[4ch] text-center text-xs tabular-nums text-(--text-secondary)">
                  {activeIndex + 1} / {count}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={active.discussionHref}
                aria-label={`Explore: ${active.title}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold",
                  "border border-(--border-default) transition-all duration-300",
                  "text-(--text-primary)",
                  "shadow-(--shadow-md)",
                  "group-hover/hero:border-(--brand-primary) group-hover/hero:shadow-[0_0_18px_2px_hsl(199_89%_48%_/_0.35)]",
                )}
                style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)" }}
              >
                Explore
                <ArrowUpRight className="h-3.5 w-3.5 text-(--text-primary) group-hover/hero:animate-[pulse_1s_ease-in-out_infinite] group-hover/hero:text-(--brand-primary)" />
              </Link>
            </div>

            {/* ── Compact toggle handle — z-40, outside drag layer ── */}
            {/* Invisible at rest; appears on hero hover; full opacity + brand glow on direct hover */}
            <button
              type="button"
              onClick={() => setCarouselState("compact")}
              aria-label="Switch to compact view"
              className={cn(
                "absolute bottom-3 left-1/2 z-40 -translate-x-1/2",
                "flex h-6 items-center gap-1.5 rounded-full px-3",
                "border border-(--border-subtle)",
                "opacity-0 group-hover/hero:opacity-50 hover:!opacity-100",
                "transition-all duration-200",
              )}
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 6px hsl(199 89% 48%/0.4))")}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}
            >
              <ChevronDown className="h-3 w-3 text-(--text-secondary)" />
              <span className="text-[10px] text-(--text-muted) font-medium">Compact</span>
            </button>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STATE: COMPACT — CSS-flex expanding cards (21st.dev / Dribbble design)
            All slides render as a flex row. Active card: flex 7 (wide).
            Inactive cards: flex 1 (narrow sliver). Pure CSS transition — no JS
            width animation. Clicking an inactive card expands it as the new active.
            ══════════════════════════════════════════════════════════════════════ */}
        {carouselState === "compact" && (
          <motion.div
            key="compact"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, delay: prefersReducedMotion ? 0 : 0.06 }}
          >
            {/* ── Expanding cards strip ── */}
            <div className="absolute inset-0 flex overflow-hidden rounded-[28px]">
              {slides.map((slide, index) => {
                const isActive  = index === activeIndex;
                const hasImage  = !!slide.coverImage && !imageErrors[slide.id];
                // Abbreviate eyebrow for the badge (strip non-alpha, take 3 chars)
                const eyebrowAbbr = slide.eyebrow.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() ||
                                    slide.eyebrow.slice(0, 3).toUpperCase();

                return (
                  <div
                    key={slide.id}
                    onClick={() => { if (!isActive) setActiveIndex(index); }}
                    className="relative overflow-hidden transition-all duration-700 ease-in-out"
                    style={{
                      // CSS flex drives the expansion — no JS animation needed
                      flex:              isActive ? "7 1 0%" : "1 1 0%",
                      backgroundImage:   hasImage ? `url('${slide.coverImage}')` : undefined,
                      // Active: image fits height exactly. Inactive: slight zoom-out.
                      backgroundSize:    isActive ? "auto 100%" : "auto 120%",
                      backgroundPosition:"center",
                      backgroundColor:   "var(--bg-surface)",
                      // Active card gets brand-cyan border; inactive gets a subtle dark border
                      border:            isActive
                                           ? "2px solid hsl(199 89% 48% / 0.7)"
                                           : "2px solid hsl(0 0% 11%)",
                      boxShadow:         isActive
                                           ? `0 20px 60px rgba(${slide.accentRgb}, 0.45), 0 8px 24px rgba(0,0,0,0.7)`
                                           : "0 10px 30px rgba(0,0,0,0.3)",
                      cursor:            isActive ? "default" : "pointer",
                      willChange:        "flex-grow",
                      // Gradient fallback when no cover image
                      ...(!hasImage && {
                        background: `linear-gradient(135deg,
                          rgba(${slide.accentRgb},0.38),
                          rgba(${slide.accentRgb},0.10))`,
                      }),
                    }}
                  >
                    {/* ── Bottom shadow overlay — sweeps up on active, hides on inactive ── */}
                    <div
                      className="absolute left-0 right-0 pointer-events-none transition-all duration-700 ease-in-out"
                      style={{
                        bottom:    isActive ? "0" : "-40px",
                        height:    "120px",
                        boxShadow: isActive
                          ? "inset 0 -120px 120px -120px #000, inset 0 -120px 120px -80px #000"
                          : "inset 0 -120px 0px -120px #000, inset 0 -120px 0px -80px #000",
                      }}
                    />

                    {/* ── Bottom label row — always rendered, text slides in on active ── */}
                    <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center gap-2.5 px-3 pointer-events-none">
                      {/* Eyebrow badge — visible on every card (collapsed and expanded) */}
                      <div
                        className="flex shrink-0 items-center justify-center rounded-full border-2"
                        style={{
                          width:          "36px",
                          height:         "36px",
                          minWidth:       "36px",
                          background:     "rgba(20,20,20,0.85)",
                          backdropFilter: "blur(10px)",
                          borderColor:    "hsl(0 0% 22%)",
                        }}
                      >
                        <span className="text-[7px] font-bold uppercase tracking-wide text-white leading-none text-center">
                          {eyebrowAbbr}
                        </span>
                      </div>

                      {/* Title + eyebrow — translates in from the right on active */}
                      <div
                        className="overflow-hidden"
                        style={{
                          opacity:         isActive ? 1 : 0,
                          transform:       isActive ? "translateX(0)" : "translateX(20px)",
                          transition:      "opacity 600ms ease-in-out, transform 600ms ease-in-out",
                          transitionDelay: isActive ? "100ms" : "0ms",
                        }}
                      >
                        <div className="text-sm font-bold leading-tight text-(--text-primary) line-clamp-1 whitespace-nowrap">
                          {slide.title}
                        </div>
                        <div className="text-[10px] text-(--text-secondary) mt-0.5 whitespace-nowrap">
                          {slide.eyebrow}
                        </div>
                      </div>
                    </div>

                    {/* ── Active card: nav pill + Explore, top-right ── */}
                    {isActive && (
                      <div
                        className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto"
                        style={{
                          opacity:         1,
                          transition:      "opacity 500ms ease-in-out",
                          transitionDelay: "200ms",
                        }}
                      >
                        {/* Nav pill */}
                        <div
                          className="flex items-center gap-0.5 rounded-full border border-(--border-default) px-1 py-0.5"
                          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)" }}
                        >
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); goPrev(); }}
                            aria-label="Previous"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <span className="min-w-[3.5ch] text-center text-[11px] tabular-nums text-(--text-secondary)">
                            {activeIndex + 1} / {count}
                          </span>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); goNext(); }}
                            aria-label="Next"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Explore button */}
                        <Link
                          href={slide.discussionHref}
                          onClick={e => e.stopPropagation()}
                          aria-label={`Explore: ${slide.title}`}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold",
                            "border border-(--border-default) transition-all duration-300",
                            "text-(--text-primary)",
                            "hover:border-(--brand-primary) hover:shadow-[0_0_12px_1px_hsl(199_89%_48%_/_0.3)]",
                          )}
                          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)" }}
                        >
                          Explore
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}

                    {/* ── Active card: full-card link (below controls at z-10) ── */}
                    {isActive && (
                      <Link
                        href={slide.discussionHref}
                        aria-label={`Open: ${slide.title}`}
                        className="absolute inset-0 z-10"
                        tabIndex={0}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Expand handle — bottom-centre, restores default state ── */}
            <button
              type="button"
              onClick={() => setCarouselState("default")}
              aria-label="Expand to full view"
              className={cn(
                "absolute bottom-2 left-1/2 z-40 -translate-x-1/2",
                "flex h-5 items-center gap-1.5 rounded-full px-2.5",
                "border border-(--border-subtle)",
                "opacity-40 hover:opacity-100",
                "transition-all duration-200",
              )}
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 5px hsl(199 89% 48%/0.4))")}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}
            >
              <ChevronUp className="h-2.5 w-2.5 text-(--text-secondary)" />
              <span className="text-[9px] text-(--text-muted)">Expand</span>
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

export function TopPostHeroCarouselSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[440px] xl:h-[520px] overflow-hidden rounded-[28px] border border-(--border-subtle) bg-(--bg-surface)",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 bg-(--bg-overlay)/10 animate-pulse" />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative h-[275px] w-full max-w-[549px] overflow-hidden rounded-[20px] bg-(--bg-overlay)/40 animate-pulse shadow-sm">
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
            <div className="mb-2.5 h-2 w-16 rounded bg-(--bg-overlay)/60" />
            <div className="mb-1.5 h-4 w-3/4 rounded bg-(--bg-overlay)/60" />
            <div className="h-4 w-1/2 rounded bg-(--bg-overlay)/60" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-7 z-30 flex items-center gap-2.5">
        <div className="h-[36px] w-[88px] animate-pulse rounded-full bg-(--bg-overlay)/60" />
        <div className="h-[36px] w-[96px] animate-pulse rounded-full bg-(--bg-overlay)/60" />
      </div>
    </div>
  );
}

export function TopPostHeroCarouselEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[440px] xl:h-[520px] overflow-hidden rounded-[28px] border border-(--border-subtle) bg-(--bg-surface)",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_52%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.02),transparent_40%)] dark:bg-[linear-gradient(to_top,rgba(255,255,255,0.02),transparent_40%)]" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--brand-primary)">Featured</p>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight text-(--text-primary)">
          No featured discussions yet
        </h2>
        <p className="mt-3 max-w-md text-sm text-(--text-secondary)">
          Add a few high-signal creator posts here to make the discussion stage feel alive.
        </p>
      </div>
    </div>
  );
}
