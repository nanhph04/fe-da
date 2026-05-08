// @ts-nocheck
/**
 * Wallet utility functions for type-safe operations
 */

import { AnyWallet, WalletType, createWallet } from "./base-wallet.types";

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
      return "bg-green-500 text-white";
    case "INACTIVE":
      return "bg-gray-500 text-white";
    case "FROZEN":
      return "bg-blue-500 text-white";
    case "SUSPENDED":
      return "bg-red-500 text-white";
    case "PENDING":
      return "bg-yellow-500 text-black";
    case "COMPLETED":
      return "bg-green-500 text-white";
    case "FAILED":
      return "bg-red-500 text-white";
    case "CANCELLED":
      return "bg-gray-500 text-white";
    case "APPROVED":
      return "bg-green-500 text-white";
    case "REJECTED":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-400 text-white";
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
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...partialData,
  };

  return createWallet(type, baseData);
}
