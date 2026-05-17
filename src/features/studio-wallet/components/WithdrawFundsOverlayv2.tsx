"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StudioWallet } from "../types/studio-wallet.types";
import { WithdrawalService } from "../services/withdrawalService";

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
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("VCB");
  const [bankName, setBankName] = useState("Vietcombank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [description, setDescription] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdrawalAmount = Number(amount);
  const canSubmit =
    Number.isFinite(withdrawalAmount) &&
    withdrawalAmount > 0 &&
    withdrawalAmount <= wallet.balance &&
    bankCode.trim().length > 0 &&
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    accountHolderName.trim().length > 0 &&
    !isBusy;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Enter a valid amount and bank account information.");
      return;
    }

    setIsBusy(true);
    setError(null);

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

      await onSuccess?.();
      onClose();
    } catch {
      setError("Failed to request withdrawal.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border/30 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-foreground">Request Withdrawal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Available balance: {wallet.balance.toLocaleString()} AC
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Amount (AC)</label>
            <Input
              type="number"
              min="1"
              max={wallet.balance}
              value={amount}
              onChange={event => setAmount(event.target.value)}
              className="border-border bg-background text-foreground"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Bank code" value={bankCode} onChange={setBankCode} placeholder="VCB" />
            <FormField label="Bank name" value={bankName} onChange={setBankName} placeholder="Vietcombank" />
            <FormField label="Account number" value={accountNumber} onChange={setAccountNumber} placeholder="0123456789" />
            <FormField label="Account holder" value={accountHolderName} onChange={setAccountHolderName} placeholder="Nguyen Van A" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Note</label>
            <Input
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Optional withdrawal note"
              className="border-border bg-background text-foreground"
            />
          </div>

          <div className="rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground/80">
            <div className="flex items-center justify-between">
              <span>Requested amount</span>
              <span>{Number.isFinite(withdrawalAmount) ? withdrawalAmount.toLocaleString() : 0} AC</span>
            </div>
            <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
              Finance-service calculates exchange rate and money amount on the backend.
            </p>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-border bg-transparent text-zinc-100 hover:bg-accent"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-destructive text-foreground hover:bg-destructive/90"
              disabled={!canSubmit}
            >
              {isBusy ? "Submitting..." : "Submit withdrawal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
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
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-border bg-background text-foreground"
      />
    </label>
  );
}
