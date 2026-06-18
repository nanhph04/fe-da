"use client";

import { useTranslations } from "next-intl";

type VisibilityValue = "public" | "private";
type VisibilityOption = {
  id: VisibilityValue;
  icon: string;
  iconFilled?: boolean;
  title: string;
  description: string;
};

interface VisibilityOptionsProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
}

export function VisibilityOptions({ value, onChange }: VisibilityOptionsProps) {
  const t = useTranslations("Studio.upload");

  const options: VisibilityOption[] = [
    {
      id: "public",
      icon: "public",
      title: t("step3.visibility.public.title"),
      description: t("step3.visibility.public.description"),
    },
    {
      id: "private",
      icon: "lock",
      iconFilled: true,
      title: t("step3.visibility.private.title"),
      description: t("step3.visibility.private.description"),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="mb-2 font-headline text-lg font-semibold text-on-surface">
        {t("step3.visibility.title")}
      </h2>
      {options.map((option) => {
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`group relative flex w-full items-start gap-4 rounded-lg border p-6 text-left transition-colors ${
              isActive
                ? "border-primary/30 bg-surface-container shadow-[0_0_20px_rgba(255,142,128,0.05)]"
                : "border-outline-variant/10 bg-surface-container-low hover:bg-surface-container"
            }`}
          >
            <span
              className={`material-symbols-outlined mt-0.5 shrink-0 text-3xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant group-hover:text-primary"
              }`}
              style={
                option.iconFilled
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
              aria-hidden="true"
            >
              {option.icon}
            </span>

            <span className="flex flex-col gap-1 pr-8">
              <span className="flex items-center gap-2">
                <span className="font-headline text-base font-semibold text-on-surface">
                  {option.title}
                </span>
              </span>
              <span className="font-body text-sm leading-relaxed text-on-surface-variant">
                {option.description}
              </span>
            </span>

            <span
              className={`absolute right-6 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors ${
                isActive ? "border-primary" : "border-outline-variant/30"
              }`}
              aria-hidden="true"
            >
              {isActive ? (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              ) : null}
            </span>
          </button>
        );
      })}
    </section>
  );
}
