"use client";

type VisibilityValue = "public" | "private";
type VisibilityOption = {
  id: VisibilityValue | "unlisted";
  icon: string;
  iconFilled?: boolean;
  title: string;
  description: string;
  disabled?: boolean;
  badge?: string;
};

interface VisibilityOptionsProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
}

const options: VisibilityOption[] = [
  {
    id: "public",
    icon: "public",
    title: "Public",
    description:
      "Everyone can watch your video after processing and moderation. It can appear on your channel and in discovery surfaces.",
  },
  {
    id: "unlisted",
    icon: "link",
    title: "Unlisted",
    description:
      "Anyone with the video link can watch it. This visibility mode is not available in the current API yet.",
    disabled: true,
    badge: "Coming soon",
  },
  {
    id: "private",
    icon: "lock",
    iconFilled: true,
    title: "Private",
    description:
      "Only viewers with explicit access can watch your video after the upload and review pipeline completes.",
  },
];

function isSupportedVisibility(value: VisibilityOption["id"]): value is VisibilityValue {
  return value === "public" || value === "private";
}

export function VisibilityOptions({ value, onChange }: VisibilityOptionsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="mb-2 font-headline text-lg font-semibold text-on-surface">Select Visibility</h2>
      {options.map((option) => {
        const isActive = value === option.id;
        const isDisabled = option.disabled || !isSupportedVisibility(option.id);

        return (
          <button
            key={option.id}
            type="button"
            disabled={isDisabled}
            aria-pressed={isActive}
            onClick={() => {
              if (isSupportedVisibility(option.id)) {
                onChange(option.id);
              }
            }}
            className={`group relative flex w-full items-start gap-4 rounded-lg border p-6 text-left transition-colors ${
              isDisabled
                ? "cursor-not-allowed border-transparent bg-surface-container-low opacity-55"
                : isActive
                  ? "border-primary/30 bg-surface-container shadow-[0_0_20px_rgba(255,142,128,0.05)]"
                  : "border-outline-variant/10 bg-surface-container-low hover:bg-surface-container"
            }`}
          >
            <span
              className={`material-symbols-outlined mt-0.5 shrink-0 text-3xl transition-colors ${
                isDisabled
                  ? "text-on-surface-variant"
                  : isActive
                    ? "text-primary"
                    : "text-on-surface-variant group-hover:text-primary"
              }`}
              style={option.iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
              aria-hidden="true"
            >
              {option.icon}
            </span>

            <span className="flex flex-col gap-1 pr-8">
              <span className="flex items-center gap-2">
                <span
                  className={`font-headline text-base font-semibold ${
                    isDisabled ? "text-on-surface-variant" : "text-on-surface"
                  }`}
                >
                  {option.title}
                </span>
                {option.badge ? (
                  <span className="rounded bg-surface-container-high px-2 py-0.5 font-body text-xs text-on-surface-variant">
                    {option.badge}
                  </span>
                ) : null}
              </span>
              <span className="font-body text-sm leading-relaxed text-on-surface-variant">
                {option.description}
              </span>
            </span>

            {!isDisabled ? (
              <span
                className={`absolute right-6 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive ? "border-primary" : "border-outline-variant/30"
                }`}
                aria-hidden="true"
              >
                {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
              </span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}
