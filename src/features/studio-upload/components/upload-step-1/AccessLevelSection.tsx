import type { UploadFormData } from "../StudioUploadFeature";

interface AccessLevelSectionProps {
  visibility: UploadFormData["visibility"];
  updateFormData: (data: Partial<UploadFormData>) => void;
}

export function AccessLevelSection({
  visibility,
  updateFormData,
}: AccessLevelSectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
        <span className="material-symbols-outlined text-[#fdc003]">lock_open</span>
        Video Access Level
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
          <div className="h-full rounded-xl border border-[#262528] bg-[#131315] p-6 transition-all hover:bg-[#19191c]/50 peer-checked:border-[#ff8e80] peer-checked:bg-[#19191c]">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined text-zinc-500 peer-checked:text-[#ff8e80]">
                public
              </span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-zinc-600 peer-checked:border-[#ff8e80] peer-checked:bg-[#ff8e80]">
                <div className="h-1.5 w-1.5 rounded-full bg-black" />
              </div>
            </div>
            <h4 className="mb-1 font-headline font-bold text-white">Public</h4>
            <p className="text-xs text-zinc-400">
              Available to everyone on your public feed.
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
          <div className="h-full rounded-xl border border-[#262528] bg-[#131315] p-6 transition-all hover:bg-[#19191c]/50 peer-checked:border-zinc-400 peer-checked:bg-[#19191c]">
            <div className="mb-4 flex items-start justify-between">
              <span
                className="material-symbols-outlined text-zinc-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-zinc-600 peer-checked:border-zinc-400 peer-checked:bg-zinc-400">
                <div className="hidden h-1.5 w-1.5 rounded-full bg-black peer-checked:block" />
              </div>
            </div>
            <h4 className="mb-1 font-headline font-bold text-white">Private</h4>
            <p className="text-xs text-zinc-400">
              Only visible to you or those with link.
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}
