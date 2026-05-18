import { Link } from "@/i18n/routing";

export function VerificationDetailFeature() {
  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-border/30 pb-8">
        <Link
          href="/admin/verifications"
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to membership review queue"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Membership Review</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">Review Detail</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">Membership review actions are handled from the queue list.</p>
        </div>
      </header>

      <article className="rounded-lg border border-border/30 bg-card p-8">
        <h2 className="font-headline text-xl font-bold text-foreground">Use the review queue</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Media Service currently exposes list and decision endpoints for membership reviews, but does not expose a separate detail endpoint by channel id.
          Approve or reject channels directly from the queue to keep the UI aligned with the available API contract.
        </p>
        <Link
          href="/admin/verifications"
          className="mt-6 inline-flex rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open Queue
        </Link>
      </article>
    </section>
  );
}
