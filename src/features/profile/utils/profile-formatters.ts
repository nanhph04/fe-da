import type { Transaction } from "@/features/wallet/types/wallet.types";

export const formatProfileDate = (value?: string | null, locale = "vi") => {
  const fallback = locale === "vi" ? "Chưa rõ" : "Unknown";
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatProfileDateTime = (value?: string | null, locale = "vi") => {
  const fallback = locale === "vi" ? "Chưa rõ" : "Unknown";
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
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

export const getTransactionTitle = (transaction: Transaction, t?: (key: string) => string) => {
  if (transaction.description) return transaction.description;

  switch (transaction.type) {
    case "DEPOSIT":
      return t ? t("walletHistory.transactions.deposit") : "Nạp Aura Coins";
    case "WITHDRAWAL":
      return t ? t("walletHistory.transactions.withdrawal") : "Rút số dư";
    case "VIDEO_PURCHASE":
      return t ? t("walletHistory.transactions.videoPurchase") : "Mở khóa video";
    case "CHANNEL_REVENUE":
      return t ? t("walletHistory.transactions.channelRevenue") : "Doanh thu kênh";
    case "SYSTEM_REVENUE":
      return t ? t("walletHistory.transactions.systemRevenue") : "Phí nền tảng";
    default:
      return t ? t("walletHistory.transactions.default") : "Giao dịch ví";
  }
};

export const getTransactionAmountLabel = (transaction: Transaction, walletId?: string | null, locale = "vi") => {
  const isIncoming = !!walletId && transaction.toWalletId === walletId;
  const sign = isIncoming || transaction.type === "DEPOSIT" ? "+" : "-";
  const formattedAmount = Math.abs(transaction.amount).toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
  return `${sign}${formattedAmount} AC`;
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

