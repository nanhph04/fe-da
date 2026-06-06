"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getErrorMessage } from "@/shared/api/client";
import type { DepositPackage } from "@/features/wallet/types/wallet.types";

import {
  AdminDepositService,
  type CreatePackagePayload,
  type UpdatePackagePayload,
} from "../services/adminDepositService";

type PackageFormState = CreatePackagePayload;
type FinanceTranslations = ReturnType<typeof useTranslations>;
type FormErrors = Partial<Record<keyof PackageFormState, string>>;
type SummaryAccent = "primary" | "secondary" | "success";

const emptyForm: PackageFormState = {
  code: "",
  name: "",
  moneyAmount: 0,
  baseCoinAmount: 0,
  bonusCoinAmount: 0,
  sortOrder: 0,
  isActive: true,
  description: "",
};

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function getPackagePresets(t: FinanceTranslations): PackageFormState[] {
  return [
    {
      code: "TOPUP_50K",
      name: t("presets.50k.name"),
      moneyAmount: 50000,
      baseCoinAmount: 500,
      bonusCoinAmount: 50,
      sortOrder: 1,
      isActive: true,
      description: t("presets.50k.description"),
    },
    {
      code: "TOPUP_100K",
      name: t("presets.100k.name"),
      moneyAmount: 100000,
      baseCoinAmount: 1000,
      bonusCoinAmount: 120,
      sortOrder: 2,
      isActive: true,
      description: t("presets.100k.description"),
    },
    {
      code: "TOPUP_200K",
      name: t("presets.200k.name"),
      moneyAmount: 200000,
      baseCoinAmount: 2000,
      bonusCoinAmount: 300,
      sortOrder: 3,
      isActive: true,
      description: t("presets.200k.description"),
    },
    {
      code: "TOPUP_500K",
      name: t("presets.500k.name"),
      moneyAmount: 500000,
      baseCoinAmount: 5000,
      bonusCoinAmount: 900,
      sortOrder: 4,
      isActive: true,
      description: t("presets.500k.description"),
    },
  ];
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function createFormFromPackage(pkg: DepositPackage): PackageFormState {
  return {
    code: pkg.code,
    name: pkg.name,
    moneyAmount: pkg.moneyAmount,
    baseCoinAmount: pkg.baseCoinAmount,
    bonusCoinAmount: pkg.bonusCoinAmount,
    sortOrder: pkg.sortOrder,
    isActive: pkg.isActive ?? true,
    description: pkg.description,
  };
}

function validatePackageForm(form: PackageFormState, t: FinanceTranslations) {
  const errors: FormErrors = {};

  if (!form.code.trim()) {
    errors.code = t("validation.codeRequired");
  }

  if (!form.name.trim()) {
    errors.name = t("validation.nameRequired");
  }

  if (form.moneyAmount <= 0) {
    errors.moneyAmount = t("validation.moneyPositive");
  }

  if (form.baseCoinAmount <= 0) {
    errors.baseCoinAmount = t("validation.baseCoinsPositive");
  }

  if (form.bonusCoinAmount < 0) {
    errors.bonusCoinAmount = t("validation.bonusCoinsNonNegative");
  }

  if (form.sortOrder < 0) {
    errors.sortOrder = t("validation.sortOrderNonNegative");
  }

  return errors;
}

function buildPackagePayload(form: PackageFormState): CreatePackagePayload {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    moneyAmount: form.moneyAmount,
    baseCoinAmount: form.baseCoinAmount,
    bonusCoinAmount: form.bonusCoinAmount,
    sortOrder: form.sortOrder,
    isActive: form.isActive,
    description: form.description.trim(),
  };
}

function buildUpdatePayload(form: PackageFormState): UpdatePackagePayload {
  return {
    name: form.name.trim(),
    moneyAmount: form.moneyAmount,
    baseCoinAmount: form.baseCoinAmount,
    bonusCoinAmount: form.bonusCoinAmount,
    sortOrder: form.sortOrder,
    isActive: form.isActive,
    description: form.description.trim(),
  };
}

function getStatusClass(isActive: boolean) {
  return isActive
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
    : "border-border/40 bg-muted text-muted-foreground";
}

function getSummary(
  packages: DepositPackage[],
  t: FinanceTranslations,
  numberFormatter: Intl.NumberFormat,
  currencyFormatter: Intl.NumberFormat,
) {
  const activePackages = packages.filter(pkg => pkg.isActive ?? true);
  const totalBonus = activePackages.reduce((sum, pkg) => sum + pkg.bonusCoinAmount, 0);
  const highestPackage = packages.reduce<DepositPackage | null>((highest, pkg) => {
    if (!highest || pkg.moneyAmount > highest.moneyAmount) {
      return pkg;
    }

    return highest;
  }, null);

  return [
    {
      label: t("summary.activePackages"),
      value: numberFormatter.format(activePackages.length),
      detail: t("summary.totalPackages", { count: packages.length }),
      icon: "inventory_2",
      accent: "primary" as SummaryAccent,
    },
    {
      label: t("summary.bonusPool"),
      value: t("common.coinAmount", { amount: numberFormatter.format(totalBonus) }),
      detail: t("summary.bonusPoolDetail"),
      icon: "paid",
      accent: "secondary" as SummaryAccent,
    },
    {
      label: t("summary.highestTopUp"),
      value: highestPackage ? currencyFormatter.format(highestPackage.moneyAmount) : "-",
      detail: highestPackage ? highestPackage.code : t("summary.noPackageConfigured"),
      icon: "trending_up",
      accent: "success" as SummaryAccent,
    },
  ] as const;
}

function getSummaryAccent(accent: SummaryAccent) {
  if (accent === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (accent === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  return "border-l-primary text-primary";
}

export function AdminFinanceFeature() {
  const t = useTranslations("Admin.finance");
  const locale = useLocale();
  const intlLocale = getIntlLocale(locale);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "VND",
  }), [intlLocale]);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(intlLocale), [intlLocale]);
  const packagePresets = useMemo(() => getPackagePresets(t), [t]);

  const [packages, setPackages] = useState<DepositPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<DepositPackage | null>(null);
  const [form, setForm] = useState<PackageFormState>(emptyForm);

  const packageSummary = useMemo(
    () => getSummary(packages, t, numberFormatter, currencyFormatter),
    [currencyFormatter, numberFormatter, packages, t],
  );

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await AdminDepositService.getAdminPackages();
      setPackages([...data].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      setError(getErrorMessage(err, t("errors.loadPackages")));
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await AdminDepositService.getAdminPackages();
        if (!cancelled) {
          setPackages([...data].sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, t("errors.loadPackages")));
          setPackages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const openCreateForm = () => {
    setEditingPackage(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const applyPreset = (preset: PackageFormState) => {
    setEditingPackage(null);
    setForm({ ...preset });
    setFormErrors({});
    setFormError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (pkg: DepositPackage) => {
    setEditingPackage(pkg);
    setForm(createFormFromPackage(pkg));
    setFormErrors({});
    setFormError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingPackage(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError(null);
  };

  const updateFormValue = <K extends keyof PackageFormState>(key: K, value: PackageFormState[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validatePackageForm(form, t);
    setFormErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSaving(true);
      if (editingPackage) {
        await AdminDepositService.updatePackage(editingPackage.id, buildUpdatePayload(form));
        setSuccessMessage(t("success.updated"));
      } else {
        await AdminDepositService.createPackage(buildPackagePayload(form));
        setSuccessMessage(t("success.created"));
      }

      closeForm();
      await loadPackages();
    } catch (err) {
      setFormError(getErrorMessage(err, t("errors.savePackage")));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePackageStatus = async (pkg: DepositPackage) => {
    try {
      setError(null);
      await AdminDepositService.updatePackage(pkg.id, { isActive: !(pkg.isActive ?? true) });
      await loadPackages();
    } catch (err) {
      setError(getErrorMessage(err, t("errors.updateStatus")));
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            {t("header.eyebrow")}
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            {t("header.title")}
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            {t("header.description")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 hover:opacity-90"
          >
            {t("actions.createPackage")}
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary/10 p-6 font-body text-sm text-primary md:flex-row md:items-center md:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadPackages()}
            className="rounded-sm border border-primary/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-primary/20"
          >
            {t("actions.retry")}
          </button>
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 font-body text-sm text-emerald-400">
          {successMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {packageSummary.map(item => (
          <article
            key={item.label}
            className={`relative overflow-hidden rounded-lg border border-border/30 border-l-4 bg-card p-6 ${getSummaryAccent(item.accent)}`}
          >
            <span className="material-symbols-outlined absolute right-4 top-4 text-6xl opacity-10" aria-hidden="true">
              {item.icon}
            </span>
            <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <h2 className="font-headline text-4xl font-black tabular-nums text-foreground">{item.value}</h2>
            <p className="mt-1 font-mono text-xs">{item.detail}</p>
          </article>
        ))}
      </div>

      {!editingPackage ? (
        <section className="rounded-lg border border-secondary/20 bg-secondary/5 p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-foreground">{t("quickCreate.title")}</h2>
              <p className="font-body text-sm text-muted-foreground">
                {t("quickCreate.description")}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-10 items-center justify-center rounded-sm border border-secondary/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
            >
              {t("actions.manualEntry")}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {packagePresets.map(preset => (
              <button
                key={preset.code}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-lg border border-border/30 bg-card p-4 text-left transition-transform hover:-translate-y-0.5 hover:border-secondary/40"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-secondary">{preset.code}</span>
                <span className="mt-2 block font-headline text-lg font-black text-foreground">
                  {currencyFormatter.format(preset.moneyAmount)}
                </span>
                <span className="mt-1 block font-body text-xs text-muted-foreground">
                  {t("quickCreate.totalCoins", { amount: numberFormatter.format(preset.baseCoinAmount + preset.bonusCoinAmount) })}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finance-package-form-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={closeForm}
            aria-label={t("actions.close")}
            disabled={isSaving}
          />
          <div className="relative max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto rounded-lg border border-border/40 bg-card shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4 border-b border-border/30 bg-background px-6 py-5">
              <div>
                <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                  {editingPackage ? t("actions.edit") : t("actions.createPackage")}
                </p>
                <h2 id="finance-package-form-title" className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                  {editingPackage ? t("form.editTitle") : t("form.createTitle")}
                </h2>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  {t("form.description")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={t("actions.close")}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="px-6 py-6">
              {formError ? (
                <div className="mb-5 rounded-lg border border-primary/30 bg-primary/10 p-4 font-body text-sm text-primary">
                  {formError}
                </div>
              ) : null}

              <form className="grid grid-cols-1 gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
                <label className="space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.code")}</span>
                  <input
                    value={form.code}
                    onChange={event => updateFormValue("code", event.target.value)}
                    disabled={Boolean(editingPackage)}
                    placeholder="TOPUP_500K"
                    className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  {formErrors.code ? <p className="text-xs text-primary">{formErrors.code}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.name")}</span>
                  <input
                    value={form.name}
                    onChange={event => updateFormValue("name", event.target.value)}
                    placeholder={t("fields.namePlaceholder")}
                    className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                  {formErrors.name ? <p className="text-xs text-primary">{formErrors.name}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.moneyAmount")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.moneyAmount}
                    onChange={event => updateFormValue("moneyAmount", Number(event.target.value))}
                    className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                  {formErrors.moneyAmount ? <p className="text-xs text-primary">{formErrors.moneyAmount}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.baseCoins")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.baseCoinAmount}
                    onChange={event => updateFormValue("baseCoinAmount", Number(event.target.value))}
                    className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                  {formErrors.baseCoinAmount ? <p className="text-xs text-primary">{formErrors.baseCoinAmount}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.bonusCoins")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.bonusCoinAmount}
                    onChange={event => updateFormValue("bonusCoinAmount", Number(event.target.value))}
                    className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                  {formErrors.bonusCoinAmount ? <p className="text-xs text-primary">{formErrors.bonusCoinAmount}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.sortOrder")}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={event => updateFormValue("sortOrder", Number(event.target.value))}
                    className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                  {formErrors.sortOrder ? <p className="text-xs text-primary">{formErrors.sortOrder}</p> : null}
                </label>

                <label className="space-y-2 lg:col-span-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("fields.description")}</span>
                  <textarea
                    value={form.description}
                    onChange={event => updateFormValue("description", event.target.value)}
                    rows={4}
                    placeholder={t("fields.descriptionPlaceholder")}
                    className="min-h-28 w-full resize-y rounded-sm border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>

                <label className="flex min-h-11 items-center gap-3 rounded-sm border border-border/40 bg-background px-4 lg:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={event => updateFormValue("isActive", event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="font-body text-sm text-foreground">{t("fields.activeHint")}</span>
                </label>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end lg:col-span-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={isSaving}
                    className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border/40 px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("actions.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? t("actions.saving") : editingPackage ? t("actions.saveChanges") : t("actions.createPackage")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/30 bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              payments
            </span>
            <h2 className="font-headline text-lg font-bold text-foreground">{t("table.title")}</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isLoading ? t("table.loading") : t("table.returnedCount", { count: packages.length })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">{t("table.columns.package")}</th>
                <th className="px-6 py-4">{t("table.columns.money")}</th>
                <th className="px-6 py-4">{t("table.columns.coins")}</th>
                <th className="px-6 py-4">{t("table.columns.sort")}</th>
                <th className="px-6 py-4 text-center">{t("table.columns.status")}</th>
                <th className="px-6 py-4">{t("table.columns.updated")}</th>
                <th className="px-6 py-4 text-right">{t("table.columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="h-12 rounded-sm bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : packages.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={7}>
                    <div className="mx-auto max-w-md space-y-4">
                      <p className="font-body text-sm text-muted-foreground">
                        {t("empty.description")}
                      </p>
                      <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:opacity-90"
                      >
                        {t("empty.cta")}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                packages.map(pkg => {
                  const isActive = pkg.isActive ?? true;

                  return (
                    <tr key={pkg.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <p className="font-headline text-sm font-bold text-foreground">{pkg.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-secondary">{pkg.code}</p>
                        <p className="mt-1 max-w-xs truncate font-body text-xs text-muted-foreground">{pkg.description}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {currencyFormatter.format(pkg.moneyAmount)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        <span className="block text-sm font-bold text-foreground">
                          {t("common.coinAmount", { amount: numberFormatter.format(pkg.totalCoinAmount) })}
                        </span>
                        {t("table.coinBreakdown", {
                          base: numberFormatter.format(pkg.baseCoinAmount),
                          bonus: numberFormatter.format(pkg.bonusCoinAmount),
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">{pkg.sortOrder}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-sm border px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-widest ${getStatusClass(isActive)}`}>
                          {isActive ? t("status.active") : t("status.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {formatDate(pkg.updatedAt, locale, t("common.notAvailable"))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(pkg)}
                            className="rounded-sm border border-border/40 px-3 py-2 font-headline text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
                          >
                            {t("actions.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => void togglePackageStatus(pkg)}
                            className="rounded-sm border border-primary/30 px-3 py-2 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
                          >
                            {isActive ? t("actions.disable") : t("actions.enable")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
