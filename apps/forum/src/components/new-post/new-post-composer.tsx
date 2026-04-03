"use client";

import type { ComponentType, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Briefcase,
  GitCompare,
  Heading2,
  HelpCircle,
  Italic,
  LayoutList,
  Link2,
  List,
  Lock,
  Newspaper,
  PenLine,
  Quote,
  Rocket,
  Sparkles,
  Star,
  Swords,
  Underline as UnderlineIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, CategoryKey } from "@/types";

const categoryIconMap: Record<CategoryKey, ComponentType<{ className?: string }>> = {
  news: Newspaper,
  review: Star,
  compare: GitCompare,
  "launch-pad": Rocket,
  debate: Swords,
  help: HelpCircle,
  list: LayoutList,
  showcase: Sparkles,
  gigs: Briefcase,
};

function CategoryLucideIcon({ categoryKey, className }: { categoryKey: CategoryKey; className?: string }) {
  const Icon = categoryIconMap[categoryKey];
  return <Icon className={className} />;
}

interface NewPostComposerProps {
  categories: Category[];
}

function MenuBtn({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)",
        active && "bg-(--bg-overlay) text-(--text-primary)",
      )}
    >
      {children}
    </button>
  );
}

export function NewPostComposer({ categories }: NewPostComposerProps) {
  const defaultCategory = useMemo(
    () => categories.find((c) => !c.lockedByDefault)?.key ?? categories[0]?.key ?? "news",
    [categories],
  );
  const [categoryKey, setCategoryKey] = useState<CategoryKey>(defaultCategory);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc pl-6 my-3" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-6 my-3" } },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-2 border-(--border-prominent) pl-4 my-4 italic text-(--text-secondary)",
          },
        },
      }),
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-(--brand-primary) underline underline-offset-2" },
      }),
      Placeholder.configure({
        placeholder: "Tell your story…",
      }),
    ],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "new-post-prose tiptap focus:outline-hidden min-h-[42vh] max-w-none text-lg leading-[1.75] text-(--text-primary)",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handlePublish = useCallback(() => {
    if (!title.trim()) {
      showToast("Add a title before publishing.");
      return;
    }
    const bodyText = editor?.getText().trim() ?? "";
    if (!bodyText) {
      showToast("Write something in the body before publishing.");
      return;
    }
    showToast("Mock publish: post is not saved yet (API pending).");
  }, [editor, showToast, title]);

  const handleDraft = useCallback(() => {
    showToast("Draft saved locally in this session only (mock).");
  }, [showToast]);

  if (!editor) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-muted)">Loading editor…</div>
    );
  }

  return (
    <section className="animate-route-emerge mx-auto w-full max-w-[720px] px-2 pb-28 pt-4 md:px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-(--text-muted)">
          <PenLine className="h-4 w-4" />
          <span>Start a discussion</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleDraft}>
            Save draft
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">Category</p>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const selected = cat.key === categoryKey;
          const locked = cat.lockedByDefault;
          return (
            <button
              key={cat.key}
              type="button"
              disabled={locked}
              title={
                locked && cat.pointsToUnlock != null
                  ? `Unlock at ${cat.pointsToUnlock} reputation points`
                  : cat.description
              }
              onClick={() => !locked && setCategoryKey(cat.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                locked && "cursor-not-allowed opacity-45",
                selected && !locked && "border-(--border-active) bg-(--bg-overlay) text-(--text-primary)",
                !selected &&
                  !locked &&
                  "border-(--border-subtle) bg-(--bg-surface) text-(--text-secondary) hover:border-(--border-prominent)",
              )}
              style={
                selected && !locked ? { boxShadow: `inset 0 0 0 1px ${cat.primaryColor}55` } : undefined
              }
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ color: cat.primaryColor }}>
                <CategoryLucideIcon categoryKey={cat.key} className="h-3.5 w-3.5" />
              </span>
              {cat.name}
              {locked ? <Lock className="h-3 w-3 text-(--text-muted)" aria-hidden /> : null}
            </button>
          );
        })}
      </div>

      <input
        aria-label="Post title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 w-full border-0 bg-transparent text-4xl font-bold leading-tight tracking-tight text-(--text-primary) outline-hidden placeholder:text-(--text-muted) md:text-5xl"
      />

      <input
        aria-label="Subtitle or summary"
        placeholder="Optional subtitle — a one-line hook for the feed"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="mb-8 w-full border-0 bg-transparent text-xl font-normal leading-snug text-(--text-secondary) outline-hidden placeholder:text-(--text-muted) md:text-2xl"
      />

      <div className="relative">
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-lg border border-(--border-default) bg-(--bg-surface-elevated) px-1 py-1 shadow-(--shadow-md)"
        >
          <MenuBtn
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuBtn>
          <span className="mx-1 h-5 w-px bg-(--border-default)" aria-hidden />
          <MenuBtn
            label="Heading"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn label="Link" active={editor.isActive("link")} onClick={setLink}>
            <Link2 className="h-4 w-4" />
          </MenuBtn>
        </BubbleMenu>
        <EditorContent editor={editor} />
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-full border border-(--border-default) bg-(--bg-surface-elevated) px-4 py-2 text-center text-sm text-(--text-primary) shadow-(--shadow-lg) md:bottom-8"
        >
          {toast}
        </div>
      ) : null}
    </section>
  );
}
