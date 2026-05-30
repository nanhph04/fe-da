import { useTranslations } from "next-intl";
import type { UploadFormData } from "../StudioUploadFeature";

interface AccessLevelSectionProps {
  visibility: UploadFormData["visibility"];
  updateFormData: (data: Partial<UploadFormData>) => void;
}

export function AccessLevelSection({
  visibility,
  updateFormData,
}: AccessLevelSectionProps) {
  const t = useTranslations("Studio.upload");

  return (
    <section className="space-y-6">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        <span className="material-symbols-outlined text-[#fdc003]">lock_open</span>
        {t("step3.visibility.titleAccess")}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="group relative cursor-pointer">
          <input
            type="radio"
            name="access_level"
            className="peer sr-only"
            checked={visibility === "public"}
            onChange={() => updateFormData({ visibility: "public" })}
          />
          <div className="h-full rounded-xl border border-border bg-card p-6 transition-all hover:bg-background/50 peer-checked:border-primary peer-checked:bg-background">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined text-muted-foreground peer-checked:text-primary">
                public
              </span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-border peer-checked:border-primary peer-checked:bg-primary">
                <div className="h-1.5 w-1.5 rounded-full bg-input" />
              </div>
            </div>
            <h4 className="mb-1 font-headline font-bold text-foreground">{t("step3.visibility.public.title")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("step3.visibility.public.descriptionShort")}
            </p>
          </div>
        </label>

        <label className="group relative cursor-pointer">
          <input
            type="radio"
            name="access_level"
            className="peer sr-only"
            checked={visibility === "private"}
            onChange={() => updateFormData({ visibility: "private" })}
          />
          <div className="h-full rounded-xl border border-border bg-card p-6 transition-all hover:bg-background/50 peer-checked:border-zinc-400 peer-checked:bg-background">
            <div className="mb-4 flex items-start justify-between">
              <span
                className="material-symbols-outlined text-muted-foreground"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-border peer-checked:border-zinc-400 peer-checked:bg-zinc-400">
                <div className="hidden h-1.5 w-1.5 rounded-full bg-input peer-checked:block" />
              </div>
            </div>
            <h4 className="mb-1 font-headline font-bold text-foreground">{t("step3.visibility.private.title")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("step3.visibility.private.descriptionShort")}
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}
