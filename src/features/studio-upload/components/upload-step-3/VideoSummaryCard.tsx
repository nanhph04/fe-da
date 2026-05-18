import type { UploadFormData } from "../StudioUploadFeature";

interface VideoSummaryCardProps {
  formData: UploadFormData;
}

export function VideoSummaryCard({ formData }: VideoSummaryCardProps) {
  const priceLabel = formData.price > 0 ? `${formData.price} AC` : "Free";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-low shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="relative aspect-video w-full overflow-hidden bg-surface-container-highest">
        {formData.thumbnailPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={formData.thumbnailPreviewUrl}
            alt="Custom thumbnail preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,142,128,0.22),transparent_32%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-container-low to-transparent" />
        <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 font-headline text-xs font-semibold text-foreground">
          {formData.thumbnailFile ? "Custom thumbnail" : "Draft"}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline text-base font-bold leading-snug text-on-surface">
            {formData.title || "Untitled upload"}
          </h3>
          <p className="font-body text-xs text-on-surface-variant">
            {formData.rawUploadCompleted ? "Raw uploaded • Ready to confirm" : "Draft metadata • Waiting for raw upload"}
          </p>
        </div>

        {formData.requiredTierLevel ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded border border-secondary/20 bg-secondary/10 px-2.5 py-1 font-headline text-xs font-semibold text-secondary shadow-[0_0_10px_rgba(253,192,3,0.05)]">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                star
              </span>
              Level {formData.requiredTierLevel}: Exclusive
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-outline-variant/10 py-3">
          <span className="font-body text-sm text-on-surface-variant">Unlock Price</span>
          <span className="flex items-center gap-1 font-headline text-lg font-bold text-on-surface">
            {formData.price > 0 ? (
              <span className="material-symbols-outlined text-base text-secondary" aria-hidden="true">
                monetization_on
              </span>
            ) : null}
            {priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
