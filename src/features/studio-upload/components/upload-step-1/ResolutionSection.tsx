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
  return (
    <section className="space-y-4 rounded-xl border border-[#262528] bg-[#131315] p-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Processing Resolutions
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Các độ phân giải này khớp với body `resolutions` của API xử lý video.
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
              <div className="rounded-lg border border-[#262528] bg-[#19191c] px-4 py-3 text-sm font-bold text-zinc-300 transition-all peer-checked:border-[#ff8e80] peer-checked:bg-[#ff8e80]/10 peer-checked:text-[#ffb2aa]">
                {resolution}
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
