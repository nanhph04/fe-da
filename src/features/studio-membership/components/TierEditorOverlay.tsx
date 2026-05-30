import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TIER_LEVELS, type TierEditorPayload, type TierEditorState, type TierLevel } from "./StudioMembershipFeature";

interface TierEditorOverlayProps {
  editorState: TierEditorState;
  availableLevels: TierLevel[];
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: TierEditorPayload) => void;
}

const MIN_PRICE_BY_LEVEL: Record<TierLevel, number> = {
  1: 50,
  2: 100,
  3: 200,
};

export function TierEditorOverlay({
  editorState,
  availableLevels,
  isSaving,
  error,
  onClose,
  onSave,
}: TierEditorOverlayProps) {
  const t = useTranslations("Studio.memberships.editor");
  const locale = useLocale();
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";
  const editingTier = editorState.mode === "edit" ? editorState.tier : null;
  const initialLevel = editorState.mode === "create" ? editorState.level : editingTier?.level ?? 1;
  const [level, setLevel] = useState<TierLevel>(initialLevel);
  const [name, setName] = useState(editingTier?.name || t("defaultName", { level: initialLevel }));
  const [price, setPrice] = useState(editingTier?.price || MIN_PRICE_BY_LEVEL[initialLevel]);
  const [isAcceptingNew, setIsAcceptingNew] = useState(editingTier?.isAcceptingNew ?? true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const minPrice = MIN_PRICE_BY_LEVEL[level];

  const selectableLevels = editorState.mode === "edit"
    ? [editingTier?.level ?? level]
    : availableLevels.length > 0
      ? availableLevels
      : [level];

  const handleLevelChange = (nextLevel: TierLevel) => {
    const isDefaultName = TIER_LEVELS.some((option) => (
      name === t("defaultName", { level: option }) || name === `Level ${option} Membership`
    ));

    setLevel(nextLevel);
    setPrice((currentPrice) => Math.max(currentPrice, MIN_PRICE_BY_LEVEL[nextLevel]));
    if (!name.trim() || isDefaultName) {
      setName(t("defaultName", { level: nextLevel }));
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError(t("validation.nameRequired"));
      return;
    }

    if (price < minPrice) {
      setValidationError(t("validation.minPrice", { minPrice, level }));
      return;
    }

    setValidationError(null);
    onSave({
      level,
      name: trimmedName,
      priceCoin: price,
      isAcceptingNew,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg border border-border/40 bg-card shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden border-r border-border/30 bg-muted/30 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="mb-4 inline-flex rounded-sm bg-primary/15 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest text-primary">
              {editorState.mode === "edit" ? t("eyebrow.edit") : t("eyebrow.create")}
            </span>
            <h3 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
              {t("sideTitle")}
            </h3>
            <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">
              {t("sideDescription")}
            </p>
          </div>

          <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">{t("monthlyPrice")}</p>
            <p className="mt-2 font-headline text-4xl font-black text-secondary">{price.toLocaleString(numberLocale)} AC</p>
            <p className="mt-2 font-body text-xs text-muted-foreground">{t("levelSummary", { level })}</p>
          </div>
        </aside>

        <section className="flex max-h-[90vh] flex-col">
          <header className="flex items-center justify-between border-b border-border/30 bg-muted/40 px-6 py-4">
            <div>
              <h3 className="font-headline text-xl font-bold text-foreground">
                {editorState.mode === "edit" ? t("title.edit") : t("title.create")}
              </h3>
              <p className="font-body text-xs text-muted-foreground">{t("description")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={t("actions.closeAria")}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="grid gap-6 overflow-y-auto p-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.accessLevel")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIER_LEVELS.map((option) => {
                    const disabled = !selectableLevels.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={disabled || editorState.mode === "edit" || isSaving}
                        onClick={() => handleLevelChange(option)}
                        className={`rounded-sm py-3 font-headline text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          level === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("fields.levelShort", { level: option })}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.tierName")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("fields.namePlaceholder")}
                  disabled={isSaving}
                  className="w-full rounded-md border border-border/40 bg-input px-4 py-3 font-headline font-bold text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("fields.monthlyPrice")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                    monetization_on
                  </span>
                  <input
                    type="number"
                    min={minPrice}
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    disabled={isSaving}
                    className="w-full rounded-md border border-border/40 bg-input py-3 pl-12 pr-4 font-headline font-bold text-foreground outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <p className="font-body text-[10px] text-muted-foreground">
                  {t("fields.priceHint", { minPrice, level })}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-md border border-border/30 bg-muted/40 p-4">
                <div className="min-w-0 space-y-1">
                  <span id="accept-new-members-label" className="block font-label text-xs font-bold uppercase tracking-widest text-foreground">
                    {t("fields.acceptNewMembers")}
                  </span>
                  <span className="block font-body text-xs leading-5 text-muted-foreground">
                    {t("fields.acceptNewMembersHint")}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAcceptingNew}
                  aria-labelledby="accept-new-members-label"
                  onClick={() => setIsAcceptingNew((current) => !current)}
                  disabled={isSaving}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
                    isAcceptingNew ? "border-primary bg-primary/90" : "border-border/50 bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-sm transition-transform duration-200 ${
                      isAcceptingNew ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-md border border-border/30 bg-muted/40 p-4">
                <p className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("joinStatus.title")}</p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-body text-sm font-semibold text-foreground">
                      {isAcceptingNew ? t("joinStatus.open") : t("joinStatus.closed")}
                    </p>
                    <p className="font-body text-xs leading-5 text-muted-foreground">
                      {isAcceptingNew
                        ? t("joinStatus.openDescription")
                        : t("joinStatus.closedDescription")}
                    </p>
                  </div>
                  <span
                    className={`rounded-sm border px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${
                      isAcceptingNew
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                        : "border-border/40 bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {isAcceptingNew ? t("joinStatus.on") : t("joinStatus.off")}
                  </span>
                </div>
              </div>

              <div className="rounded-md border border-secondary/20 bg-secondary/10 p-4">
                <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">{t("payout.title")}</p>
                <p className="mt-2 font-body text-xs leading-5 text-foreground">
                  {t("payout.description")}
                </p>
              </div>
            </div>
          </div>

          {validationError || error ? (
            <p className="border-t border-destructive/30 bg-destructive/10 px-6 py-3 text-sm text-destructive" role="alert">
              {validationError || error}
            </p>
          ) : null}

          <footer className="flex gap-4 border-t border-border/30 bg-muted/40 p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 font-headline text-sm font-bold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] rounded-sm bg-primary py-3 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? t("actions.saving") : t("actions.save")}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
