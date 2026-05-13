"use client";

interface PublishActionsProps {
  canPublish: boolean;
  isPublishing: boolean;
  onPublish: () => void;
}

export function PublishActions({ canPublish, isPublishing, onPublish }: PublishActionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={onPublish}
        disabled={!canPublish || isPublishing}
        className={`flex w-full items-center justify-center gap-2 rounded-sm py-3.5 font-headline text-sm font-bold transition-opacity ${
          canPublish && !isPublishing
            ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0_10px_20px_rgba(255,142,128,0.2)] hover:opacity-90"
            : "cursor-not-allowed bg-surface-container-high text-on-surface-variant shadow-none"
        }`}
      >
        {isPublishing ? (
          <span className="h-5 w-5 rounded-full border-2 border-on-surface border-t-transparent animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-lg">upload</span>
        )}
        Upload & Publish
      </button>

      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm border border-outline-variant/30 bg-transparent py-3.5 font-headline text-sm font-semibold text-on-surface-variant/60"
        aria-describedby="save-draft-note"
      >
        <span className="material-symbols-outlined text-lg">save</span>
        Save as Draft
      </button>
      <p id="save-draft-note" className="text-center font-body text-xs text-on-surface-variant">
        Draft is created when upload is initialized.
      </p>
    </div>
  );
}
