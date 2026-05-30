import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function StudioTierEditorFeature() {
  const t = useTranslations("Studio.memberships.moved");

  return (
    <main className="mx-auto w-full max-w-4xl p-8">
      <section className="rounded-lg border border-border/30 bg-card p-8">
        <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("eyebrow")}</p>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
          {t("description")}
        </p>
        <Link
          href="/studio/memberships"
          className="mt-6 inline-flex rounded-sm bg-primary px-5 py-3 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("back")}
        </Link>
      </section>
    </main>
  );
}
