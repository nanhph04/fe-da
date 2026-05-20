import { Subscriptions } from "@/features/library";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

type SubscriptionsLibraryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SubscriptionsLibraryPage({ params }: SubscriptionsLibraryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Library.SubscriptionsPage" });

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-20 md:pl-64">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 via-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-48 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 animate-in fade-in duration-500 sm:px-6 md:px-8 md:py-12">
        <section className="relative overflow-hidden rounded-lg border border-border/30 bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10" />
          <div className="absolute -right-16 top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div className="max-w-3xl space-y-6">
              <Link
                href="/library"
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-sm border border-border/30 bg-background/60 px-3 py-2 font-headline text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:text-foreground active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/70"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_back
                </span>
                {t("backToLibrary")}
              </Link>

              <div className="space-y-4">
                <p className="font-headline text-xs font-black uppercase tracking-[0.28em] text-secondary">
                  {t("eyebrow")}
                </p>
                <h1 className="max-w-2xl text-balance font-headline text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
                  {t("title")}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  {t("description")}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/30 bg-background/65 p-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t("controlEyebrow")}
                  </p>
                  <p className="font-headline text-lg font-bold text-foreground">{t("controlTitle")}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    workspace_premium
                  </span>
                </div>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-md border border-border/20 bg-card p-3">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("summary.statusLabel")}
                  </p>
                  <p className="mt-2 font-headline text-sm font-bold text-foreground">
                    {t("summary.statusValue")}
                  </p>
                </div>
                <div className="rounded-md border border-border/20 bg-card p-3">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("summary.renewalLabel")}
                  </p>
                  <p className="mt-2 font-headline text-sm font-bold text-secondary">
                    {t("summary.renewalValue")}
                  </p>
                </div>
                <div className="rounded-md border border-border/20 bg-card p-3">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("summary.accessLabel")}
                  </p>
                  <p className="mt-2 font-headline text-sm font-bold text-foreground">
                    {t("summary.accessValue")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <Subscriptions />
          </div>

          <aside className="space-y-6 xl:col-span-2">
            <section className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-secondary/40 via-border/30 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    autorenew
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="font-headline text-xl font-bold text-foreground">{t("autoRenew.title")}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("autoRenew.description")}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border/30 bg-card p-6">
              <div className="space-y-2">
                <p className="font-headline text-xs font-black uppercase tracking-[0.22em] text-secondary">
                  {t("note.eyebrow")}
                </p>
                <h2 className="font-headline text-xl font-bold text-foreground">{t("note.title")}</h2>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-md border border-border/20 bg-background/60 p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
                      event_available
                    </span>
                    <p className="text-sm leading-6 text-muted-foreground">{t("note.cancel")}</p>
                  </div>
                </div>
                <div className="rounded-md border border-border/20 bg-background/60 p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
                      admin_panel_settings
                    </span>
                    <p className="text-sm leading-6 text-muted-foreground">{t("note.admin")}</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
