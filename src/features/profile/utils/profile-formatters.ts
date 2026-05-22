import type { Transaction } from "@/features/wallet/types/wallet.types";

export const formatProfileDate = (value?: string | null) => {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatProfileDateTime = (value?: string | null) => {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const getInitials = (value?: string | null) => {
  const cleaned = value?.trim();
  if (!cleaned) return "V";

  return cleaned.charAt(0).toUpperCase();
};

export const getAvatarFallbackUrl = (name?: string | null) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Velvet Gallery")}&background=131313&color=ffffff&length=1`;

export const getTransactionTitle = (transaction: Transaction) => {
  if (transaction.description) return transaction.description;

  switch (transaction.type) {
    case "DEPOSIT":
      return "Nạp Aura Coins";
    case "WITHDRAWAL":
      return "Rút số dư";
    case "VIDEO_PURCHASE":
      return "Mở khóa video";
    case "CHANNEL_REVENUE":
      return "Doanh thu kênh";
    case "SYSTEM_REVENUE":
      return "Phí nền tảng";
    default:
      return "Giao dịch ví";
  }
};

export const getTransactionAmountLabel = (transaction: Transaction, walletId?: string | null) => {
  const isIncoming = !!walletId && transaction.toWalletId === walletId;
  const sign = isIncoming || transaction.type === "DEPOSIT" ? "+" : "-";
  return `${sign}${Math.abs(transaction.amount).toLocaleString("vi-VN")} AC`;
};

export const getTransactionTone = (transaction: Transaction, walletId?: string | null) => {
  if (transaction.status === "FAILED" || transaction.status === "CANCELLED") return "muted";
  if (!!walletId && transaction.toWalletId === walletId) return "positive";
  if (transaction.type === "DEPOSIT") return "positive";
  return "default";
};

export const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return "--:--";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
