"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";

const reportReasons = [
  "Spam or misleading",
  "Harassment or abuse",
  "Unsafe content",
  "Low quality / irrelevant",
] as const;

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  /** Defaults to feed copy for posts */
  title?: string;
  description?: string;
}

export function ReportPostDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "Report post",
  description = "Select a reason and we will hide this post from your feed.",
}: ReportPostDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-(--border-default) bg-(--bg-surface) p-4 shadow-(--shadow-lg)">
          <Dialog.Title className="text-base font-semibold text-(--text-primary)">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-(--text-secondary)">{description}</Dialog.Description>

          <div className="mt-4 grid gap-2">
            {reportReasons.map((reason) => (
              <Button
                key={reason}
                variant="secondary"
                className="justify-start"
                onClick={() => onSubmit(reason)}
              >
                {reason}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
