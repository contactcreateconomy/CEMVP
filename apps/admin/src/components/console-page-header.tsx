import type { ReactNode } from "react";

interface ConsolePageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function ConsolePageHeader({ title, description, actions }: ConsolePageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
