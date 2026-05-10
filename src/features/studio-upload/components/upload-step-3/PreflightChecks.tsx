const checks = [
  { label: "Metadata", detail: "Required fields are ready" },
  { label: "Categories", detail: "Will be validated by media service" },
  { label: "Monetization", detail: "Pricing configuration prepared" },
];

export function PreflightChecks() {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-5 shadow-sm">
      <h4 className="font-headline text-sm font-semibold text-on-surface">Pre-flight Checks</h4>
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
