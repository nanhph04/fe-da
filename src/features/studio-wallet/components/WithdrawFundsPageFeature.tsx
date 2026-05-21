"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { getWalletStatusMessage } from "@/features/wallet/types/wallet-utils";
import type { StudioWallet } from "../types/studio-wallet.types";
import { WithdrawalService } from "../services/withdrawalService";

interface WithdrawFundsPageFeatureProps {
  initialWallet: StudioWallet;
}

export function WithdrawFundsPageFeature({ initialWallet }: WithdrawFundsPageFeatureProps) {
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("VCB");
  const [bankName, setBankName] = useState("Vietcombank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [description, setDescription] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const withdrawalAmount = Number(amount);
  const walletStatusMessage = getWalletStatusMessage(initialWallet.status, "withdraw");
  const canSubmit =
    !walletStatusMessage &&
    Number.isFinite(withdrawalAmount) &&
    withdrawalAmount > 0 &&
    withdrawalAmount <= initialWallet.balance &&
    bankCode.trim().length > 0 &&
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    accountHolderName.trim().length > 0 &&
    !isBusy;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (walletStatusMessage) {
      setError(walletStatusMessage);
      return;
    }

    if (!canSubmit) {
      setError("Enter a valid amount and bank account information.");
      return;
    }

    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await WithdrawalService.requestWithdrawal({
        coinAmount: withdrawalAmount,
        bankInfo: {
          bankCode: bankCode.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolderName: accountHolderName.trim(),
        },
        description: description.trim() || undefined,
      });
      setSuccess("Withdrawal request created. Administrators will review it shortly.");
      setAmount("");
      setDescription("");
    } catch {
      setError("Failed to request withdrawal.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-8 py-8">
      <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">Aura Wallet</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Withdraw Funds</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Convert available Aura Coins to a bank transfer request.</p>
        </div>
        <Link href="/studio/wallet" className="inline-flex items-center gap-2 rounded-sm border border-border/40 bg-card px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Wallet
        </Link>
      </header>

      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="space-y-8 lg:col-span-5">
          <section className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-8 shadow-2xl">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2 font-headline text-sm font-bold uppercase tracking-widest text-secondary">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                Available Balance
              </div>
              <div className="mb-2 flex items-baseline gap-3">
                <span className="font-headline text-6xl font-extrabold tracking-tight text-foreground">{initialWallet.balance.toLocaleString()}</span>
                <span className="font-headline text-2xl font-bold text-primary">AC</span>
              </div>
              <div className="font-body text-sm text-muted-foreground">Convertible balance from creator earnings.</div>
              <div className="mt-8 flex items-center justify-between border-t border-border/30 pt-8">
                <div>
                  <div className="mb-1 font-body text-xs text-muted-foreground">Wallet Status</div>
                  <div className="font-headline text-sm font-semibold text-foreground">{initialWallet.status}</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 font-body text-xs text-muted-foreground">Currency</div>
                  <div className="font-headline text-sm font-semibold text-foreground">Aura Coins</div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border/20 bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-headline font-bold text-foreground">
              <span className="material-symbols-outlined text-secondary">info</span>
              Withdrawal Guidelines
            </h2>
            <ul className="space-y-4 font-body text-sm text-muted-foreground">
              {[
                "Finance-service currently supports direct bank info in the withdrawal request.",
                "Exchange rate and money amount are calculated by the backend.",
                "Requests are reviewed by administrators before transfer.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-xs text-secondary">check_circle</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="h-full space-y-8 rounded-lg border border-border/30 bg-card p-8 shadow-2xl">
            <div className="space-y-3">
              <label className="block font-headline text-sm font-bold text-foreground">Amount to Withdraw (AC)</label>
              <div className="relative">
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-sm border-0 bg-background py-4 pl-6 pr-16 font-headline text-xl font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary"
                  placeholder="Enter amount"
                  type="number"
                  min="1"
                  max={initialWallet.balance}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-headline font-black text-primary">AC</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bank Code" value={bankCode} onChange={setBankCode} placeholder="VCB" />
              <Field label="Bank Name" value={bankName} onChange={setBankName} placeholder="Vietcombank" />
              <Field label="Account Number" value={accountNumber} onChange={setAccountNumber} placeholder="0123456789" />
              <Field label="Account Holder" value={accountHolderName} onChange={setAccountHolderName} placeholder="Nguyen Van A" />
            </div>

            <div className="space-y-3">
              <label className="block font-headline text-sm font-bold text-foreground">Note</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional withdrawal note"
                className="w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="space-y-3 rounded-lg bg-muted/40 p-6">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Requested Amount</span>
                <span className="font-headline font-bold text-foreground">{Number.isFinite(withdrawalAmount) ? withdrawalAmount.toLocaleString() : 0} AC</span>
              </div>
              <div className="flex justify-between border-t border-border/30 pt-3">
                <span className="font-headline font-bold text-foreground">Backend Calculates</span>
                <span className="font-headline font-extrabold text-secondary">VND amount + rate</span>
              </div>
            </div>

            {walletStatusMessage ? <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{walletStatusMessage}</p> : null}
            {error ? <p className="rounded-sm border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{error}</p> : null}
            {success ? <p className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">{success}</p> : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-primary py-5 font-headline font-extrabold text-primary-foreground shadow-xl shadow-primary/10 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <span className="material-symbols-outlined">send</span>
              {isBusy ? "Creating request..." : "Create Withdrawal Request"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="block font-headline text-sm font-bold text-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
