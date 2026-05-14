export function LatestComments() {
  return (
    <div className="flex h-full flex-col rounded-sm border border-border/30 bg-card p-8">
      <h2 className="mb-6 font-headline text-xl font-bold text-foreground">Latest Comments</h2>

      <div className="flex flex-1 flex-col items-center justify-center rounded-sm border border-dashed border-border/40 bg-background/50 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-muted-foreground">forum</span>
        <p className="mt-3 font-headline text-sm font-bold text-foreground">Comments are not available yet</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          The current API contract does not expose creator comments, so this panel is intentionally empty instead of showing mock data.
        </p>
      </div>
    </div>
  );
}
