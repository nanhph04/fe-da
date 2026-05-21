/**
 * Wallet utility functions for type-safe operations
 */

import { AnyWallet, WalletStatus, WalletType, createWallet } from "./base-wallet.types";

export type WalletOperation = "deposit" | "withdraw" | "spend" | "releaseRevenue";

function normalizeWalletStatus(status: WalletStatus | string): "active" | "frozen" | "closed" | "unknown" {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "active") {
    return "active";
  }

  if (normalizedStatus === "frozen" || normalizedStatus === "suspended" || normalizedStatus === "inactive") {
    return "frozen";
  }

  if (normalizedStatus === "closed") {
    return "closed";
  }

  return "unknown";
}

export function getWalletStatusMessage(status: WalletStatus | string, operation: WalletOperation): string | null {
  const normalizedStatus = normalizeWalletStatus(status);

  if (normalizedStatus === "active" || (operation === "deposit" && normalizedStatus === "frozen")) {
    return null;
  }

  if (normalizedStatus === "closed") {
    return operation === "deposit"
      ? "Ví đã đóng nên không thể nạp thêm Aura Coins."
      : "Ví đã đóng nên không thể thực hiện giao dịch này.";
  }

  if (normalizedStatus === "frozen") {
    if (operation === "withdraw") {
      return "Ví đang bị đóng băng nên không thể rút tiền.";
    }

    if (operation === "spend") {
      return "Ví đang bị đóng băng nên không thể thanh toán dịch vụ.";
    }

    if (operation === "releaseRevenue") {
      return "Ví đang bị đóng băng nên chưa thể giải ngân doanh thu.";
    }

    return "Ví đang bị đóng băng nên không thể tạo giao dịch nạp mới.";
  }

  return "Không thể xác định trạng thái ví. Vui lòng tải lại ví rồi thử lại.";
}

export function assertWalletCanOperate(status: WalletStatus | string, operation: WalletOperation) {
  const message = getWalletStatusMessage(status, operation);

  if (message) {
    throw new Error(message);
  }
}

/**
 * Get wallet type label for display
 */
export function getWalletTypeLabel(type: WalletType): string {
  switch (type) {
    case "USER":
      return "User Wallet";
    case "STUDIO":
      return "Studio Wallet";
    case "CHANNEL":
      return "Channel Wallet";
    case "SYSTEM":
      return "System Wallet";
    default:
      return "Unknown Wallet";
  }
}

/**
 * Format wallet balance with currency
 */
export function formatWalletBalance(wallet: AnyWallet, currency = "AC"): string {
  const symbol = currency === "AC" ? "AC" : currency;
  return `${wallet.balance.toLocaleString()} ${symbol}`;
}

/**
 * Format total earnings with currency
 */
export function formatTotalEarnings(earnings: number, currency = "AC"): string {
  const symbol = currency === "AC" ? "AC" : currency;
  return `${earnings.toLocaleString()} ${symbol}`;
}

/**
 * Get available wallet balance (excluding frozen balance)
 */
export function getAvailableBalance(wallet: AnyWallet): number {
  return wallet.balance;
}

/**
 * Get total balance (available + frozen)
 */
export function getTotalBalance(wallet: AnyWallet): number {
  return wallet.balance + wallet.frozenBalance;
}

/**
 * Check if wallet has sufficient balance for withdrawal
 */
export function canWithdrawAmount(wallet: AnyWallet, amount: number): boolean {
  return amount > 0 && amount <= wallet.balance;
}

/**
 * Get wallet status badge text
 */
export function getStatusBadgeText(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "FROZEN":
      return "Frozen";
    case "CLOSED":
      return "Closed";
    case "SUSPENDED":
      return "Suspended";
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "CANCELLED":
      return "Cancelled";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

/**
 * Get wallet status badge style
 */
export function getStatusBadgeStyle(status: string): string {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case "ACTIVE":
      return "bg-green-500 text-foreground";
    case "INACTIVE":
      return "bg-gray-500 text-foreground";
    case "FROZEN":
      return "bg-blue-500 text-foreground";
    case "CLOSED":
      return "bg-red-700 text-foreground";
    case "SUSPENDED":
      return "bg-red-500 text-foreground";
    case "PENDING":
      return "bg-yellow-500 text-black";
    case "COMPLETED":
      return "bg-green-500 text-foreground";
    case "FAILED":
      return "bg-red-500 text-foreground";
    case "CANCELLED":
      return "bg-gray-500 text-foreground";
    case "APPROVED":
      return "bg-green-500 text-foreground";
    case "REJECTED":
      return "bg-red-500 text-foreground";
    default:
      return "bg-gray-400 text-foreground";
  }
}

/**
 * Create a wallet with default values
 */
export function createWalletWithDefaults(type: WalletType, userId: string, partialData: Partial<AnyWallet> = {}): AnyWallet {
  const now = new Date().toISOString();
  const baseData = {
    id: `wallet_${Date.now()}`,
    userId,
    type,
    balance: 0,
    frozenBalance: 0,
    status: "active" as WalletStatus,
    createdAt: now,
    updatedAt: now,
    ...partialData,
  };

  return createWallet(type, baseData);
}
