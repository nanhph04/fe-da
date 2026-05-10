interface ProgressStepperProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { label: "Details", step: 1 },
  { label: "Monetization", step: 2 },
  { label: "Visibility", step: 3 },
] as const;

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const completedWidth = currentStep === 1 ? "w-0" : currentStep === 2 ? "w-1/2" : "w-full";

  return (
    <div className="relative w-full py-2">
      <div className="absolute left-0 right-0 top-6 h-px bg-surface-container-highest" />
      <div className={`absolute left-0 top-6 h-px bg-primary transition-all ${completedWidth}`} />

      <div className="relative z-10 grid grid-cols-3">
        {steps.map((step, index) => {
          const isCompleted = step.step < currentStep;
          const isCurrent = step.step === currentStep;
          const justifyClass = index === 0 ? "items-start" : index === 1 ? "items-center" : "items-end";

          return (
            <div key={step.step} className={`flex flex-col gap-2 ${justifyClass}`}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                  isCompleted
                    ? "border-outline-variant/30 bg-surface-container-high text-primary"
                    : isCurrent
                      ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(255,142,128,0.2)]"
                      : "border-outline-variant/30 bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    check
                  </span>
                ) : (
                  <span className="font-headline font-bold">{step.step}</span>
                )}
              </div>
              <span
                className={`font-label text-xs font-medium ${
                  isCurrent ? "font-bold text-on-surface" : "text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
