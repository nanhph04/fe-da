"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaymentMethod } from "../types/payout.types";
import type { StudioWallet } from "../types/studio-wallet.types";
import { PayoutService } from "../services/payoutService";

interface WithdrawFundsOverlayProps {
  wallet: StudioWallet;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export function WithdrawFundsOverlay({
  wallet,
  isOpen,
  onClose,
  onSuccess,
}: WithdrawFundsOverlayProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError(null);
    setAmount("");
    setDescription("");

    const loadMethods = async () => {
      try {
        const paymentMethods = await PayoutService.getPaymentMethods();
        setMethods(paymentMethods);

        const defaultMethod = paymentMethods.find(method => method.isDefault) || paymentMethods[0];
        setSelectedMethodId(defaultMethod?.id ?? "");
      } catch {
        setError("Failed to load payout methods.");
      }
    };

    void loadMethods();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedMethodId || !amount) {
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
        const quote = await PayoutService.calculateFee({
          amount: amountValue,
          methodId: selectedMethodId,
        });
        setFee(quote.fee);
      } catch {
        setFee(0);
      }
    };

    void calculate();
  }, [amount, isOpen, selectedMethodId]);

  const selectedMethod = useMemo(
    () => methods.find(method => method.id === selectedMethodId) || null,
    [methods, selectedMethodId]
  );

  const payoutAmount = Number(amount);
  const canSubmit =
    selectedMethodId.length > 0 &&
    Number.isFinite(payoutAmount) &&
    payoutAmount > 0 &&
    payoutAmount <= wallet.balance &&
    !isBusy;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Enter a valid amount and payment method.");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      await PayoutService.requestPayout({
        amount: payoutAmount,
        methodId: selectedMethodId,
        description: description.trim() || undefined,
      });

      await onSuccess?.();
      onClose();
    } catch {
      setError("Failed to request payout.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-md border border-zinc-800 bg-[#111113] shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-white">Request Payout</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Available balance: {wallet.balance.toLocaleString()} AC
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-400 hover:bg-zinc-900 hover:text-white"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Payment method</label>
            <div className="space-y-2">
              {methods.map(method => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                    selectedMethodId === method.id
                      ? "border-[#c1121f] bg-[#2a0d12]"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={selectedMethodId === method.id}
                    onChange={() => setSelectedMethodId(method.id)}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-white">{method.type}</p>
                    <p className="text-sm text-zinc-400">
                      {method.bankInfo?.bankName ||
                        method.cryptoInfo?.currency ||
                        method.eWalletInfo?.provider ||
                        "Configured payout destination"}
                    </p>
                  </div>
                </label>
              ))}
              {methods.length === 0 ? (
                <p className="text-sm text-zinc-500">No payout method available.</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Amount (AC)</label>
            <Input
              type="number"
              min="1"
              max={wallet.balance}
              value={amount}
              onChange={event => setAmount(event.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Note</label>
            <Input
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Optional payout note"
              className="border-zinc-800 bg-zinc-950 text-white"
            />
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>Requested amount</span>
              <span>{Number.isFinite(payoutAmount) ? payoutAmount.toLocaleString() : 0} AC</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Estimated fee</span>
              <span>{fee.toLocaleString()} AC</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2 font-semibold text-white">
              <span>Estimated net</span>
              <span>
                {Math.max((Number.isFinite(payoutAmount) ? payoutAmount : 0) - fee, 0).toLocaleString()} AC
              </span>
            </div>
            {selectedMethod ? (
              <p className="mt-3 text-xs text-zinc-500">
                Selected method: {selectedMethod.type}
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-800 bg-transparent text-zinc-100 hover:bg-zinc-900"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#c1121f] text-white hover:bg-[#a60f1a]"
              disabled={!canSubmit}
            >
              {isBusy ? "Submitting..." : "Submit payout"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
