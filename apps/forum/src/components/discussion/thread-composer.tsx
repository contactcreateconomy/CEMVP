"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bold, Code, Italic, Link as LinkIcon, MoreHorizontal, X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@cemvp/auth-ui";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/types";
import type { DiscussionThread } from "@/types/discussion";
import type { User } from "@/types";

const NUDGES: Record<CategoryKey, string> = {
  news: "Adding a source link makes your reply 4x more likely to be upvoted.",
  review: "Mention which version or plan you used — context builds trust.",
  compare: "Which use case are you optimising for? It makes your comparison actionable.",
  "launch-pad": "Specific feedback ('the onboarding step 3 is unclear') is more useful than general praise.",
  debate: "The strongest arguments cite a counter-argument directly before refuting it.",
  help: "Include your error message and what you've already tried — it cuts reply time in half.",
  list: "If you're suggesting an addition, explain why it meets the stated criteria.",
  showcase: "Tell us which aspect you want feedback on — UX, visuals, or technical approach.",
  gigs: "If you're a candidate, lead with your most relevant work, not your resume.",
};

function mockUserForComposer(authUser: { id: string; name: string; handle: string; avatar?: string } | null): User | null {
  if (!authUser) return null;
  return {
    id: authUser.id,
    name: authUser.name,
    handle: authUser.handle,
    avatar: authUser.avatar ?? "",
    bio: "",
    level: 4,
    points: 5000,
    streakDays: 1,
    role: "member",
  };
}

interface ThreadComposerProps {
  thread: DiscussionThread;
  placeholder?: string;
  onSubmit?: () => void;
  compact?: boolean;
  /** Top-level composer: controlled by parent (thread discussion context) */
  mainValue?: string;
  onMainValueChange?: (value: string | ((prev: string) => string)) => void;
}

export function ThreadComposer({
  thread,
  placeholder = "Join the discussion…",
  onSubmit,
  compact,
  mainValue,
  onMainValueChange,
}: ThreadComposerProps) {
  const { user: authUser, authStatus } = useAuth();
  const [localText, setLocalText] = useState("");
  const [dismissNudge, setDismissNudge] = useState(false);

  const isMainControlled = mainValue !== undefined && onMainValueChange !== undefined;
  const text = isMainControlled ? mainValue : localText;
  const setText = isMainControlled ? onMainValueChange : setLocalText;

  const mockUser = mockUserForComposer(authStatus === "authenticated" && authUser ? { ...authUser, id: authUser.id } : null);
  const u =
    mockUser ??
    ({
      id: "guest",
      name: "Guest",
      handle: "guest",
      avatar: "",
      bio: "",
      level: 1,
      points: 0,
      streakDays: 0,
      role: "member" as const,
    } satisfies User);

  const nudgeText = NUDGES[thread.category];
  const showNudge = text.trim().length >= 20 && !dismissNudge && !compact;

  const insert = useCallback(
    (wrap: string) => {
      setText((t) => `${typeof t === "string" ? t : ""}${wrap}`);
    },
    [setText],
  );

  const submit = () => {
    if (!text.trim()) return;
    setText(() => "");
    onSubmit?.();
  };

  const toolbarActions = (
    <>
      <ToolbarIcon label="Bold" onClick={() => insert("**bold**")}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarIcon>
      <ToolbarIcon label="Italic" onClick={() => insert("_italic_")}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarIcon>
      <ToolbarIcon label="Code" onClick={() => insert("`code`")}>
        <Code className="h-3.5 w-3.5" />
      </ToolbarIcon>
      <ToolbarIcon label="Code block" onClick={() => insert("\n```\ncode\n```\n")}>
        <span className="text-[10px] font-mono">{"{}"}</span>
      </ToolbarIcon>
      <ToolbarIcon label="Link" onClick={() => insert("[text](url)")}>
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarIcon>
    </>
  );

  return (
    <div
      id={isMainControlled ? "thread-main-composer" : undefined}
      className={cn(compact ? "space-y-2" : "space-y-3")}
    >
      <div className="flex items-start gap-3 rounded-[14px] border border-(--border-default) bg-(--bg-surface) p-3">
        <UserAvatar user={u} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <textarea
            id={isMainControlled ? "main-composer-textarea" : undefined}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={compact ? 3 : 4}
            className="min-h-[80px] w-full resize-y rounded-lg border border-(--border-subtle) bg-(--bg-inset) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--border-active) focus:outline-hidden"
          />
          <div className="flex flex-wrap items-center gap-1 border-t border-(--border-subtle) pt-2">
            <div className="hidden items-center gap-1 md:flex">{toolbarActions}</div>
            <div className="flex md:hidden">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg-overlay)"
                    aria-label="Formatting"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    className="z-50 min-w-[180px] rounded-[12px] border border-(--border-default) bg-(--bg-surface) p-1 shadow-(--shadow-lg)"
                  >
                    <DropdownMenu.Item
                      className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)"
                      onSelect={() => insert("**bold**")}
                    >
                      Bold
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)"
                      onSelect={() => insert("_italic_")}
                    >
                      Italic
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)"
                      onSelect={() => insert("`code`")}
                    >
                      Inline code
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)"
                      onSelect={() => insert("\n```\ncode\n```\n")}
                    >
                      Code block
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)"
                      onSelect={() => insert("[text](url)")}
                    >
                      Link
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            <Button type="button" size="sm" className="ml-auto" disabled={!text.trim()} onClick={submit}>
              Reply
            </Button>
          </div>
        </div>
      </div>
      {showNudge ? (
        <div className="flex items-start gap-2 rounded-[12px] border border-(--border-default) bg-(--bg-inset) p-3 text-sm text-(--text-secondary)">
          <p className="flex-1">{nudgeText}</p>
          <button type="button" className="text-(--text-muted) hover:text-(--text-primary)" aria-label="Dismiss" onClick={() => setDismissNudge(true)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ToolbarIcon({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
    >
      {children}
    </button>
  );
}
