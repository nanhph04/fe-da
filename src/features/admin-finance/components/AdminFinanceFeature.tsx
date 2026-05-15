"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { DepositPackage } from "@/features/wallet/types/wallet.types";

import {
  AdminDepositService,
  type CreatePackagePayload,
  type UpdatePackagePayload,
} from "../services/adminDepositService";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "VND",
});

const numberFormatter = new Intl.NumberFormat("en-US");

type PackageFormState = CreatePackagePayload;

type FormErrors = Partial<Record<keyof PackageFormState, string>>;

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

const packagePresets: PackageFormState[] = [
  {
    code: "TOPUP_50K",
    name: "Goi 50.000 VND",
    moneyAmount: 50000,
    baseCoinAmount: 500,
    bonusCoinAmount: 50,
    sortOrder: 1,
    isActive: true,
    description: "Goi nap pho bien cho nguoi xem moi.",
  },
  {
    code: "TOPUP_100K",
    name: "Goi 100.000 VND",
    moneyAmount: 100000,
    baseCoinAmount: 1000,
    bonusCoinAmount: 120,
    sortOrder: 2,
    isActive: true,
    description: "Tang them Aura Coin cho nguoi dung nap thuong xuyen.",
  },
  {
    code: "TOPUP_200K",
    name: "Goi 200.000 VND",
    moneyAmount: 200000,
    baseCoinAmount: 2000,
    bonusCoinAmount: 300,
    sortOrder: 3,
    isActive: true,
    description: "Goi nap gia tri cao voi bonus tot hon.",
  },
  {
    code: "TOPUP_500K",
    name: "Goi 500.000 VND",
    moneyAmount: 500000,
    baseCoinAmount: 5000,
    bonusCoinAmount: 900,
    sortOrder: 4,
    isActive: true,
    description: "Goi nap lon cho nguoi dung ung ho creator thuong xuyen.",
  },
];

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
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

function validatePackageForm(form: PackageFormState) {
  const errors: FormErrors = {};

  if (!form.code.trim()) {
    errors.code = "Package code is required.";
  }

  if (!form.name.trim()) {
    errors.name = "Package name is required.";
  }

  if (form.moneyAmount <= 0) {
    errors.moneyAmount = "Money amount must be greater than 0.";
  }

  if (form.baseCoinAmount <= 0) {
    errors.baseCoinAmount = "Base coin amount must be greater than 0.";
  }

  if (form.bonusCoinAmount < 0) {
    errors.bonusCoinAmount = "Bonus coin amount cannot be negative.";
  }

  if (form.sortOrder < 0) {
    errors.sortOrder = "Sort order cannot be negative.";
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

function getStatusClass(isActive: boolean | undefined) {
  return isActive
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
    : "border-border/40 bg-muted text-muted-foreground";
}

function getSummary(packages: DepositPackage[]) {
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
      label: "Active Packages",
      value: numberFormatter.format(activePackages.length),
      detail: `${numberFormatter.format(packages.length)} total packages`,
      icon: "inventory_2",
      accent: "primary",
    },
    {
      label: "Bonus Pool",
      value: `${numberFormatter.format(totalBonus)} AC`,
      detail: "Bonus coins across active packages",
      icon: "paid",
      accent: "secondary",
    },
    {
      label: "Highest Top-up",
      value: highestPackage ? currencyFormatter.format(highestPackage.moneyAmount) : "-",
      detail: highestPackage ? highestPackage.code : "No package configured",
      icon: "trending_up",
      accent: "success",
    },
  ] as const;
}

function getSummaryAccent(accent: ReturnType<typeof getSummary>[number]["accent"]) {
  if (accent === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (accent === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  return "border-l-primary text-primary";
}

export function AdminFinanceFeature() {
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

  const packageSummary = useMemo(() => getSummary(packages), [packages]);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await AdminDepositService.getAdminPackages();
      setPackages([...data].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      setError(getErrorMessage(err, "Khong the tai danh sach goi nap."));
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
          setError(getErrorMessage(err, "Khong the tai danh sach goi nap."));
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
  }, []);

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
    setForm(preset);
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

    const nextErrors = validatePackageForm(form);
    setFormErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSaving(true);
      if (editingPackage) {
        await AdminDepositService.updatePackage(editingPackage.id, buildUpdatePayload(form));
        setSuccessMessage("Da cap nhat goi nap thanh cong.");
      } else {
        await AdminDepositService.createPackage(buildPackagePayload(form));
        setSuccessMessage("Da tao goi nap thanh cong.");
      }

      closeForm();
      await loadPackages();
    } catch (err) {
      setFormError(getErrorMessage(err, "Khong the luu goi nap."));
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
      setError(getErrorMessage(err, "Khong the cap nhat trang thai goi nap."));
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            Finance Control
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            Deposit Package Management
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Manage VND to Aura Coin top-up packages shown on the viewer wallet checkout flow.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground">
            Live API
          </span>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 hover:opacity-90"
          >
            Tao goi nap
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
            Retry
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
              <h2 className="font-headline text-lg font-bold text-foreground">Tao nhanh goi nap</h2>
              <p className="font-body text-sm text-muted-foreground">
                Chon preset de tu dien form, sau do kiem tra va bam tao goi nap.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-10 items-center justify-center rounded-sm border border-secondary/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10"
            >
              Nhap thu cong
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
                  {numberFormatter.format(preset.baseCoinAmount + preset.bonusCoinAmount)} AC total
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {isFormOpen ? (
        <section className="rounded-lg border border-border/30 bg-card p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-headline text-xl font-bold text-foreground">
                {editingPackage ? "Chinh sua goi nap" : "Tao goi nap moi"}
              </h2>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Only send fields accepted by finance-service DTO. Total coins are derived by the backend response.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-sm border border-border/40 px-3 py-2 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>

          {formError ? (
            <div className="mb-5 rounded-lg border border-primary/30 bg-primary/10 p-4 font-body text-sm text-primary">
              {formError}
            </div>
          ) : null}

          <form className="grid grid-cols-1 gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="space-y-2">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Code</span>
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
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</span>
              <input
                value={form.name}
                onChange={event => updateFormValue("name", event.target.value)}
                placeholder="Goi 500.000 VND"
                className="min-h-11 w-full rounded-sm border border-border/40 bg-background px-4 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
              {formErrors.name ? <p className="text-xs text-primary">{formErrors.name}</p> : null}
            </label>

            <label className="space-y-2">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Money Amount</span>
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
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Base Coins</span>
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
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Bonus Coins</span>
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
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort Order</span>
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
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</span>
              <textarea
                value={form.description}
                onChange={event => updateFormValue("description", event.target.value)}
                rows={3}
                placeholder="Tang them coin cho nguoi dung nap lon"
                className="w-full resize-none rounded-sm border border-border/40 bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex min-h-11 items-center gap-3 rounded-sm border border-border/40 bg-background px-4 lg:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={event => updateFormValue("isActive", event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-body text-sm text-foreground">Package is active and visible to viewer top-up flow.</span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : editingPackage ? "Save Changes" : "Create Package"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border/40 px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/30 bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              payments
            </span>
            <h2 className="font-headline text-lg font-bold text-foreground">Deposit Packages</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isLoading ? "Loading..." : `${packages.length} packages returned by finance-service`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Money</th>
                <th className="px-6 py-4">Coins</th>
                <th className="px-6 py-4">Sort</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                        Chua co goi nap nao. Tao goi dau tien de hien thi trong wallet checkout.
                      </p>
                      <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:opacity-90"
                      >
                        Tao goi nap dau tien
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                packages.map(pkg => (
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
                      <span className="block text-sm font-bold text-foreground">{numberFormatter.format(pkg.totalCoinAmount)} AC</span>
                      Base {numberFormatter.format(pkg.baseCoinAmount)} + Bonus {numberFormatter.format(pkg.bonusCoinAmount)}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-foreground">{pkg.sortOrder}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-sm border px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-widest ${getStatusClass(pkg.isActive)}`}>
                        {pkg.isActive ?? true ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{formatDate(pkg.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(pkg)}
                          className="rounded-sm border border-border/40 px-3 py-2 font-headline text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void togglePackageStatus(pkg)}
                          className="rounded-sm border border-primary/30 px-3 py-2 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
                        >
                          {pkg.isActive ?? true ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
