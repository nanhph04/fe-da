import { useTranslations } from "next-intl";

export function PreflightChecks() {
  const t = useTranslations("Studio.upload");

  const checks = [
    { label: t("step3.preflight.metadataLabel"), detail: t("step3.preflight.metadataDetail") },
    { label: t("step3.preflight.categoryLabel"), detail: t("step3.preflight.categoryDetail") },
    { label: t("step3.preflight.monetizationLabel"), detail: t("step3.preflight.monetizationDetail") },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-5 shadow-sm">
      <h4 className="font-headline text-sm font-semibold text-on-surface">{t("step3.preflight.title")}</h4>
      <div className="flex flex-col gap-3">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              check_circle
            </span>
            <div className="flex flex-col">
              <span className="font-body text-sm font-medium text-on-surface">{check.label}</span>
              <span className="font-body text-xs text-on-surface-variant">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
