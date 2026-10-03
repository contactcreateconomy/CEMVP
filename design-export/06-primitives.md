# Shared UI primitives (visual only)

This app's `components/ui/` folder does not use the exact names "Badge"/"Pill" — the closest visual equivalents are `AvatarWithName` (a labeled avatar/pill used for category tags) and `UserAvatar`. Included below are all primitives from `apps/forum/src/components/ui/` that carry meaningful className/style content. Skipped as logic-only / no meaningful styling: `use-scroll.ts` (scroll-position hook, no markup) and `../../lib/utils.ts` `cn()` helper (className merge utility, no markup).

Full contents of `apps/forum/src/components/ui/`:
- avatar.tsx
- button.tsx
- card.tsx
- createconomy-logo-mark.tsx
- glowing-effect.tsx
- user-avatar.tsx
- avatar-with-name.tsx
- input.tsx
- image-uploader.tsx (not included — form/upload logic component, not a core visual primitive; flag if needed)
- navigation-progress-bar.tsx (not included — out of scope for feed page)
- toggle-switch.tsx (not included — out of scope for feed page; styling lives in 01-tokens.md's `.toggle-*` CSS if needed)
- network-hover-card.tsx (not included — out of scope for feed page)

---

## apps/forum/src/components/ui/avatar.tsx

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
```

---

## apps/forum/src/components/ui/button.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg-canvas disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-pressed dark:electric-glow",
        secondary:
          "border border-border-prominent bg-transparent text-text-primary hover:bg-bg-overlay hover:border-border-active",
        ghost:
          "bg-transparent text-text-secondary hover:bg-bg-overlay hover:text-text-primary",
        destructive:
          "bg-feedback-error text-white hover:opacity-90",
      },
      size: {
        xs: "h-7 px-2.5 text-[11px]",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
        xl: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

---

## apps/forum/src/components/ui/card.tsx

```tsx
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-surface", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-2 p-4 pb-2", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}
```

---

## apps/forum/src/components/ui/createconomy-logo-mark.tsx

```tsx
import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

interface CreateconomyLogoMarkProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  size?: number | string;
  markColor?: string;
  separatorColor?: string;
  decorative?: boolean;
  title?: string;
}

export function CreateconomyLogoMark({
  size = 32,
  markColor = "var(--brand-primary)",
  separatorColor = "var(--bg-canvas)",
  decorative = true,
  title,
  className,
  ...props
}: CreateconomyLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 22 22"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": title ?? "Createconomy logo" })}
      {...props}
    >
      {!decorative && title ? <title>{title}</title> : null}

      <g fill={markColor}>
        <path d="M10 1A10 10 0 0 0 10 21Z" />
        <path d="M12 1A9 9 0 0 1 21 10H12Z" />
        <rect x="12" y="12" width="9" height="9" />
      </g>

      <g fill={separatorColor}>
        <rect x="10" y="1" width="2" height="20" />
        <rect x="12" y="10" width="9" height="2" />
      </g>
    </svg>
  );
}
```

---

## apps/forum/src/components/ui/glowing-effect.tsx

```tsx
"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { animate } from "motion/react";

import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1],
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          const targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration],
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border border-gray-200 opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "block!",
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                      from 236.84deg at 50% 50%,
                      var(--black),
                      var(--black) calc(25% / var(--repeating-conic-gradient-times))
                    )`
                  : `radial-gradient(circle, #38bdf8 10%, #38bdf800 20%),
                    radial-gradient(circle at 40% 40%, #7dd3fc 5%, #7dd3fc00 15%),
                    radial-gradient(circle at 60% 60%, #0ea5e9 10%, #0ea5e900 20%),
                    radial-gradient(circle at 40% 60%, #0369a1 10%, #0369a100 20%),
                    repeating-conic-gradient(
                      from 236.84deg at 50% 50%,
                      #38bdf8 0%,
                      #7dd3fc calc(25% / var(--repeating-conic-gradient-times)),
                      #0ea5e9 calc(50% / var(--repeating-conic-gradient-times)),
                      #0369a1 calc(75% / var(--repeating-conic-gradient-times)),
                      #38bdf8 calc(100% / var(--repeating-conic-gradient-times))
                    )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-(--blur)",
            className,
            disabled && "hidden!",
          )}
        >
          <div
            className={cn(
              "glow rounded-[inherit]",
              'after:content-[""] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))] after:rounded-[inherit]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:bg-fixed",
              "after:opacity-(--active) after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:mask-intersect",
              "after:mask-[linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
            )}
          />
        </div>
      </>
    );
  },
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
```

---

## apps/forum/src/components/ui/user-avatar.tsx

```tsx
"use client";

import { useMemo, useState } from "react";

import { getUserLevelRingColor } from "@/lib/user-levels";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  authorName?: string | null;
}

const sizeClassMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
} as const;

const imageSizeMap = {
  sm: 28,
  md: 36,
  lg: 44,
} as const;

export function UserAvatar({ user, size = "md", className, authorName }: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ringColor = getUserLevelRingColor(user?.level ?? 1);

  const ringShadow = useMemo(() => {
    const emboss = "0 1px 1px rgba(255,255,255,0.18) inset, 0 -1px 1px rgba(0,0,0,0.22) inset";
    const ring = `0 0 0 2px ${ringColor}`;
    const glow = isHovered ? `, 0 0 10px ${ringColor}99` : "";
    return `${emboss}, ${ring}${glow}`;
  }, [isHovered, ringColor]);

  const targetName = user?.name || authorName;
  const initials = targetName
    ? targetName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-(--bg-canvas) transition-transform duration-150 hover:-translate-y-0.5",
        className,
      )}
      style={{ boxShadow: ringShadow }}
      aria-hidden
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {user?.avatar && !imageError ? (
        // Native <img>: profile images may come from Convex storage or any OAuth host;
        // next/image would throw if the hostname is not in remotePatterns (production crash).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt=""
          width={imageSizeMap[size]}
          height={imageSizeMap[size]}
          className={`${sizeClassMap[size]} rounded-full object-cover`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <span
          className={`${sizeClassMap[size]} inline-flex items-center justify-center rounded-full bg-(--bg-surface) text-[10px] font-semibold text-(--text-secondary)`}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
```

---

## apps/forum/src/components/ui/avatar-with-name.tsx

(Renders as `AvatarWithName` — the "pill" used for the category tag in the post interaction row: an avatar/icon that reveals a name label on hover.)

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, type ReactNode, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

export interface NativeAvatarProps {
  src?: string;
  name: string;
  fallback?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  direction?: "top" | "bottom" | "left" | "right";
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  motionClassName?: string;
  avatarStyle?: CSSProperties;
  labelStyle?: CSSProperties;
}

const sizeVariants = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

const nameSizeVariants = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
  xl: "text-lg px-5 py-2.5",
};

export function Component({
  src,
  name,
  fallback,
  icon,
  size = "md",
  direction = "bottom",
  className,
  avatarClassName,
  nameClassName,
  motionClassName,
  avatarStyle,
  labelStyle,
}: NativeAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (value: string) => {
    return value
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const directionVariants = {
    top: {
      initial: { y: 20, opacity: 0, filter: "blur(4px)" },
      animate: { y: -8, opacity: 1, filter: "blur(0px)" },
      exit: { y: 20, opacity: 0, filter: "blur(4px)" },
    },
    bottom: {
      initial: { y: -20, opacity: 0, filter: "blur(4px)" },
      animate: { y: 8, opacity: 1, filter: "blur(0px)" },
      exit: { y: -20, opacity: 0, filter: "blur(4px)" },
    },
    left: {
      initial: { x: 20, opacity: 0, filter: "blur(4px)" },
      animate: { x: -8, opacity: 1, filter: "blur(0px)" },
      exit: { x: 20, opacity: 0, filter: "blur(4px)" },
    },
    right: {
      initial: { x: -20, opacity: 0, filter: "blur(4px)" },
      animate: { x: 8, opacity: 1, filter: "blur(0px)" },
      exit: { x: -20, opacity: 0, filter: "blur(4px)" },
    },
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={motionClassName}
      >
        <Avatar
          className={cn(
            sizeVariants[size],
            "cursor-pointer transition-[transform,colors,box-shadow] duration-200 group-hover/cat:-translate-y-px group-hover/cat:bg-(--bg-overlay) group-hover/cat:shadow-[0_0_10px_rgba(14,165,233,0.3)]",
            avatarClassName,
          )}
          style={avatarStyle}
        >
          {icon ? null : <AvatarImage src={src || "/placeholder.svg"} alt={name} />}
          <AvatarFallback className={cn("font-semibold", icon ? "text-(--text-primary)" : "text-muted-foreground")}>
            {icon ?? fallback ?? getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={directionVariants[direction].initial}
            animate={directionVariants[direction].animate}
            exit={directionVariants[direction].exit}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              opacity: { duration: 0.2 },
              filter: { duration: 0.2 },
            }}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-gray-200 bg-popover text-popover-foreground shadow-lg",
              nameSizeVariants[size],
              positionClasses[direction],
              nameClassName,
            )}
            style={labelStyle}
          >
            <span className="font-medium">{name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## apps/forum/src/components/ui/input.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-border-default bg-(--bg-overlay)/60 px-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-[border-color,box-shadow] duration-200 focus:border-border-active focus:outline-none focus:ring-1 focus:ring-sky-500/40 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
```
