import { useTranslations } from "next-intl";
import type { UploadFormData } from "../StudioUploadFeature";
import { RESOLUTION_OPTIONS } from "./constants";

interface ResolutionSectionProps {
  resolutions: UploadFormData["resolutions"];
  updateFormData: (data: Partial<UploadFormData>) => void;
}

export function ResolutionSection({
  resolutions,
  updateFormData,
}: ResolutionSectionProps) {
  const t = useTranslations("Studio.upload");

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          {t("step1.resolutions.title")}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("step1.resolutions.hint")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {RESOLUTION_OPTIONS.map((resolution) => {
          const isSelected = resolutions.includes(resolution);

          return (
            <label key={resolution} className="cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isSelected}
                onChange={() =>
                  updateFormData({
                    resolutions: isSelected
                      ? resolutions.filter(item => item !== resolution)
                      : [...resolutions, resolution],
                  })
                }
              />
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-bold text-foreground/80 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
                {resolution}
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
