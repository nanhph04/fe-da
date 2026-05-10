"use client";

export function AdminHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/30 bg-background/80 px-6 backdrop-blur-xl md:left-64 md:px-8">
      <div className="flex items-center gap-4">
        <div className="font-display text-lg font-bold tracking-tight text-foreground md:hidden">System Admin</div>
        <div className="relative hidden md:block group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            className="w-96 rounded-sm border border-border/40 bg-input py-2.5 pl-10 pr-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-0"
            placeholder="Search by UID, email, video hash..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          type="button"
          aria-label="View admin notifications"
          className="relative rounded p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <span className="material-symbols-outlined">notifications_active</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-3 border-l border-border/30 pl-4 md:pl-6">
          <div className="hidden text-right sm:block">
            <p className="font-headline text-xs font-bold text-foreground">SYS_ADMIN</p>
            <p className="font-mono text-[10px] tracking-widest text-primary">LEVEL 5</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-muted font-headline text-xs font-bold text-primary">
            SA
          </div>
        </div>
      </div>
    </header>
  );
}
