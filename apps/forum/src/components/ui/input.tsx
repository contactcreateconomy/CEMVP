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
