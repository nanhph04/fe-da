"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PaymentMethod } from "../types/payout.types";
import type { StudioWallet } from "../types/studio-wallet.types";
import { PayoutService } from "../services/payoutService";

interface WithdrawFundsPageFeatureProps {
  initialWallet: StudioWallet;
}

export function WithdrawFundsPageFeature({ initialWallet }: WithdrawFundsPageFeatureProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const paymentMethods = await PayoutService.getPaymentMethods();
        setMethods(paymentMethods);
        const defaultMethod = paymentMethods.find((method) => method.isDefault) || paymentMethods[0];
        setSelectedMethodId(defaultMethod?.id ?? "");
      } catch {
        setError("Failed to load payout methods.");
      }
    };

    void loadMethods();
  }, []);

  useEffect(() => {
    if (!selectedMethodId || !amount) {
      setFee(0);
      return;
    }

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFee(0);
      return;
    }

    const calculate = async () => {
      try {
        const quote = await PayoutService.calculateFee({ amount: amountValue, methodId: selectedMethodId });
        setFee(quote.fee);
      } catch {
        setFee(0);
      }
    };

    void calculate();
  }, [amount, selectedMethodId]);

  const selectedMethod = useMemo(
    () => methods.find((method) => method.id === selectedMethodId) || null,
    [methods, selectedMethodId]
  );

  const payoutAmount = Number(amount);
  const netAmount = Math.max((Number.isFinite(payoutAmount) ? payoutAmount : 0) - fee, 0);
  const canSubmit =
    selectedMethodId.length > 0 &&
    Number.isFinite(payoutAmount) &&
    payoutAmount > 0 &&
    payoutAmount <= initialWallet.balance &&
    !isBusy;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Enter a valid amount and payment method.");
      return;
    }

    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await PayoutService.requestPayout({
        amount: payoutAmount,
        methodId: selectedMethodId,
        description: description.trim() || undefined,
      });
      setSuccess("Payout request created. Administrators will review it shortly.");
      setAmount("");
      setDescription("");
    } catch {
      setError("Failed to request payout.");
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
          <p className="mt-2 font-body text-sm text-muted-foreground">Convert available Aura Coins to your configured payout destination.</p>
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
                "Use an active payout method before creating a request.",
                "Fees are calculated from the selected payout method.",
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
              <div className="flex items-center justify-between px-1">
                <span className="font-body text-xs text-muted-foreground">Estimated net:</span>
                <span className="font-headline text-sm font-bold text-secondary">{netAmount.toLocaleString()} AC</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block font-headline text-sm font-bold text-foreground">Payout Method</label>
              <div className="grid grid-cols-1 gap-4">
                {methods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center justify-between rounded-sm border p-4 text-left transition-colors ${
                      selectedMethodId === method.id ? "border-primary/40 bg-muted" : "border-border/30 bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        className="accent-primary"
                        checked={selectedMethodId === method.id}
                        onChange={() => setSelectedMethodId(method.id)}
                      />
                      <div>
                        <div className="font-headline text-sm font-bold text-foreground">{method.type}</div>
                        <div className="font-body text-xs text-muted-foreground">
                          {method.bankInfo?.bankName || method.cryptoInfo?.currency || method.eWalletInfo?.provider || "Configured payout destination"}
                        </div>
                      </div>
                    </div>
                    {selectedMethodId === method.id ? (
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    ) : null}
                  </label>
                ))}
                {methods.length === 0 ? <p className="rounded-sm border border-border/30 bg-background p-4 text-sm text-muted-foreground">No payout method available.</p> : null}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block font-headline text-sm font-bold text-foreground">Note</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional payout note"
                className="w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="space-y-3 rounded-lg bg-muted/40 p-6">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Requested Amount</span>
                <span className="font-headline font-bold text-foreground">{Number.isFinite(payoutAmount) ? payoutAmount.toLocaleString() : 0} AC</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Estimated Fee</span>
                <span className="font-headline font-bold text-primary">{fee.toLocaleString()} AC</span>
              </div>
              <div className="flex justify-between border-t border-border/30 pt-3">
                <span className="font-headline font-bold text-foreground">Estimated Net</span>
                <span className="font-headline font-extrabold text-secondary">{netAmount.toLocaleString()} AC</span>
              </div>
              {selectedMethod ? <p className="font-body text-xs text-muted-foreground">Selected method: {selectedMethod.type}</p> : null}
            </div>

            {error ? <p className="rounded-sm border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{error}</p> : null}
            {success ? <p className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">{success}</p> : null}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-3 rounded-sm bg-primary py-5 font-headline font-extrabold text-primary-foreground shadow-xl shadow-primary/10 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                <span className="material-symbols-outlined">send</span>
                {isBusy ? "Creating request..." : "Create Payout Request"}
              </button>
              <p className="text-center font-body text-xs italic text-muted-foreground">Request will be reviewed by administrators.</p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
