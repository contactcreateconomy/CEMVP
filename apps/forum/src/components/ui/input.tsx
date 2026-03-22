import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 text-sm text-(--text-primary) placeholder:text-(--text-muted) outline-hidden transition-[border-color] duration-200 focus:border-(--border-active) focus:outline-hidden focus:ring-0 focus-visible:outline-hidden focus-visible:ring-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
