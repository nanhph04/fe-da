import { Link } from "@/i18n/routing";

type LegalSection = {
  title: string;
  body: string;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedLabel: string;
  updatedAt: string;
  sections: LegalSection[];
  backHomeLabel: string;
};

export function LegalPage({
  eyebrow,
  title,
  description,
  updatedLabel,
  updatedAt,
  sections,
  backHomeLabel,
}: LegalPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-20 text-foreground sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(229,9,20,0.16),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(245,158,11,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-black/40 via-background/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          {backHomeLabel}
        </Link>

        <section className="overflow-hidden rounded-lg border border-border/30 bg-card/88 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="border-b border-border/20 px-6 py-10 sm:px-10 lg:px-12">
            <p className="mb-4 font-headline text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl font-headline text-4xl font-extrabold leading-tight tracking-[-0.02em] text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {updatedLabel}: <span className="text-foreground/80">{updatedAt}</span>
            </p>
          </div>

          <div className="space-y-8 px-6 py-10 sm:px-10 lg:px-12">
            {sections.map((section, index) => (
              <section key={section.title} className="grid gap-4 border-b border-border/10 pb-8 last:border-b-0 last:pb-0 sm:grid-cols-[72px_1fr]">
                <div className="font-headline text-sm font-extrabold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold tracking-[-0.02em] text-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                    {section.body}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
