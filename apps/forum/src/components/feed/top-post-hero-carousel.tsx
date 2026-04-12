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
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

import type { TopPostHeroSlide } from "@/types/hero";
import { cn } from "@/lib/utils";

// ─── Physics ──────────────────────────────────────────────────────────────────
const BASE_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const;
const TAP_SPRING  = { type: "spring", stiffness: 450, damping: 18, mass: 1 } as const;

// ─── Swipe ────────────────────────────────────────────────────────────────────
const SWIPE_CONFIDENCE = 8000;

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

// ─── Wheel debounce ───────────────────────────────────────────────────────────
const WHEEL_LOCKOUT_MS = 400;
const WHEEL_THRESHOLD  = 20;

// ─── Card geometry ────────────────────────────────────────────────────────────
const X_STRIDE     = 440;   // spacing between card centres
const Z_STRIDE     = 160;   // depth per step
const ROTATE_Y_DEG = 12;    // tilt per step
const SIDE_COUNT   = 2;     // ghost cards on each side
const TOP_PAD      = 16;
const BOTTOM_PAD   = 20;
const RIGHT_PAD    = 28;    // nav/explore right edge inset

// ─── Layout (measured dynamically to match sorter width) ──────────────────────
interface Layout {
  cardW:  number;
  cardH:  number;  // 2:1 of cardW — slightly shorter than 16:9
  focusX: number;  // sorter centre − hero centre → aligns card to feed column
}

function defaultLayout(): Layout {
  const cardW = 549;
  return { cardW, cardH: Math.round(cardW * 0.5 * 0.95), focusX: -40 };
}

// ─── Per-card transform — symmetric cascade, focusX shifts stack to match sorter
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

interface TopPostHeroCarouselProps {
  slides: TopPostHeroSlide[];
  className?: string;
}

export function TopPostHeroCarousel({ slides, className }: TopPostHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused]       = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [layout, setLayout]           = useState<Layout>(defaultLayout);
  const heroRef                       = useRef<HTMLDivElement>(null);
  const wheelLocked                   = useRef(false);
  const prefersReducedMotion          = useReducedMotion();
  const count = slides.length;

  // ── Measure sorter width → derive cardW and cardH ───────────────────────────
  useEffect(() => {
    function measure() {
      const sorterEl = document.querySelector<HTMLElement>('.grid.grid-cols-4');
      if (!sorterEl) return;
      const heroRect   = heroRef.current!.getBoundingClientRect();
      const sorterRect = sorterEl.getBoundingClientRect();
      const cardW   = sorterRect.width;
      const cardH   = Math.round(cardW * 0.5 * 0.95);   // 2:1 × 0.95 — 5% reduction
      const focusX  = (sorterRect.left + cardW / 2) - (heroRect.left + heroRect.width / 2);
      setLayout({ cardW, cardH, focusX });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── Auto-advance ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, 5200);
    return () => window.clearInterval(id);
  }, [isPaused, count]);

  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % count), [count]);
  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + count) % count), [count]);

  // ── Mouse wheel ─────────────────────────────────────────────────────────────
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

  // ── Drag / swipe ────────────────────────────────────────────────────────────
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

  // Symmetric: [-2, -1, 0, 1, 2]
  const visibleOffsets = Array.from(
    { length: SIDE_COUNT * 2 + 1 },
    (_, i) => i - SIDE_COUNT,
  );

  return (
    <div
      ref={heroRef}
      className={cn(
        "group/hero relative overflow-hidden rounded-[28px] bg-(--bg-surface) select-none",
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onWheel={handleWheel}
      aria-roledescription="carousel"
      aria-label="Featured posts carousel"
    >
      {/* ── AMBIENT BACKGROUND ── */}
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

      {/* ── 3D STAGE — symmetric cascade, edge-fades both sides ── */}
      <div
        className="absolute inset-x-0 z-10 flex items-center justify-center"
        style={{
          top:               TOP_PAD,
          bottom:            BOTTOM_PAD,
          perspective:       "1200px",
          perspectiveOrigin: "50% 50%",
          // fade both edges so ghost cards dissolve naturally
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
                  border: "1px solid transparent",
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                {/* Cover image */}
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

                {/* Cinematic lower-third — covers bottom ~45% of card.
                    Strong enough for bright/white images (office, daylight, product shots).
                    Multi-stop gradient so it never looks like a hard bar — it blends upward.
                    Edge cases covered: white image → still 90% opacity at bottom;
                    dark image → looks even better (additive darkening). */}
                {isCenter && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, " +
                        "rgba(0,0,0,0.90) 0%, " +
                        "rgba(0,0,0,0.80) 15%, " +
                        "rgba(0,0,0,0.62) 28%, " +
                        "rgba(0,0,0,0.32) 42%, " +
                        "rgba(0,0,0,0.08) 56%, " +
                        "transparent 68%)",
                    }}
                  />
                )}

                {/* Text overlay — eyebrow + title, inside the card at the bottom */}
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
                      <h2 className="text-xl font-bold leading-snug text-white line-clamp-2 drop-shadow-sm">
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

      {/* ── NAV + EXPLORE — static, no animation tied to slide index ── */}
      <div
        className="absolute z-30 flex items-center gap-2.5"
        style={{ right: RIGHT_PAD, bottom: BOTTOM_PAD + 4 }}
      >
        {/* Nav pill — glassmorphic */}
        <div
          className="flex items-center gap-0.5 rounded-full border border-white/10 px-1 py-1"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)" }}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4ch] text-center text-xs tabular-nums text-white/70">
            {activeIndex + 1} / {count}
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Explore pill — glassmorphic, cyan glow on card hover, arrow pulses on card hover */}
        <Link
          href={active.discussionHref}
          aria-label={`Explore: ${active.title}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold",
            "border border-white/20 transition-all duration-300",
            "text-(--text-primary)",
            "shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
            "group-hover/hero:border-[hsl(199_89%_48%)] group-hover/hero:shadow-[0_0_18px_2px_hsl(199_89%_48%_/_0.45)]",
          )}
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)" }}
        >
          Explore
          <ArrowUpRight className="h-3.5 w-3.5 text-(--text-primary) group-hover/hero:animate-[pulse_1s_ease-in-out_infinite] group-hover/hero:text-(--brand-primary)" />
        </Link>
      </div>
    </div>
  );
}
