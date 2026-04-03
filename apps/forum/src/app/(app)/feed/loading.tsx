export default function FeedLoading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full rounded-2xl bg-(--bg-overlay) animate-pulse" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="animate-pulse space-y-3 rounded-2xl border border-(--border-default) bg-(--bg-surface) p-4">
          <div className="h-5 w-2/3 rounded bg-(--bg-overlay)" />
          <div className="h-3 w-1/3 rounded bg-(--bg-overlay)" />
          <div className="h-40 rounded-xl bg-(--bg-overlay)" />
        </div>
      ))}
    </div>
  );
}
