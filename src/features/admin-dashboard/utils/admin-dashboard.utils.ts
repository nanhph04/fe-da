import type { AdminDashboardData, AdminPriorityAction, AdminStatCard } from "../types/admin-dashboard.types";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "VND",
});

export function formatCount(value: number): string {
  return numberFormatter.format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "growth unavailable";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}% / 30 days`;
}

export function buildAdminStatCards(data: AdminDashboardData): AdminStatCard[] {
  const activePackages = data.depositPackages.filter(item => item.isActive !== false).length;
  const totalConfiguredCoins = data.depositPackages.reduce(
    (total, item) => total + (item.totalCoinAmount || item.baseCoinAmount + item.bonusCoinAmount),
    0
  );
  const activeCategories = data.categories.filter(item => item.status === "active").length;
  const pendingTags = data.tags.filter(item => item.status === "pending").length;

  return [
    data.usersSummary
      ? {
          id: "users",
          label: "Total Network Users",
          value: formatCount(data.usersSummary.totalUsers),
          detail: `${formatCount(data.usersSummary.activeUsers30d)} active users - ${formatPercent(data.usersSummary.growth30dPercent)}`,
          icon: "groups",
          tone: "default",
          href: "/admin/users",
        }
      : {
          id: "users",
          label: "Total Network Users",
          value: "Unavailable",
          detail: "Identity users summary did not load",
          icon: "groups",
          tone: "default",
          href: "/admin/users",
          unavailable: true,
        },
    data.channelsSummary
      ? {
          id: "creators",
          label: "Active Creators",
          value: formatCount(data.channelsSummary.activeCreators30d),
          detail: `${formatCount(data.channelsSummary.totalChannels)} channels - ${formatCount(data.channelsSummary.uploadingNow)} uploading now`,
          icon: "movie_edit",
          tone: "primary",
          href: "/admin/channels",
        }
      : {
          id: "creators",
          label: "Active Creators",
          value: "Unavailable",
          detail: "Creator/channel summary did not load",
          icon: "movie_edit",
          tone: "primary",
          href: "/admin/channels",
          unavailable: true,
        },
    data.reportsSummary
      ? {
          id: "moderation",
          label: "Active Alerts / Reports",
          value: formatCount(data.reportsSummary.pendingReports),
          detail: `${formatCount(data.reportsSummary.pendingManualReviewVideos)} manual reviews - ${formatCount(data.reportsSummary.autoFlaggedVideos)} auto flagged`,
          icon: "warning",
          tone: "warning",
          href: "/admin/content/review",
        }
      : {
          id: "moderation",
          label: "Active Alerts / Reports",
          value: "Unavailable",
          detail: "Moderation summary did not load",
          icon: "warning",
          tone: "warning",
          href: "/admin/content/review",
          unavailable: true,
        },
    data.withdrawalSummary
      ? {
          id: "payouts",
          label: "Payouts Pending",
          value: formatCount(data.withdrawalSummary.pendingCoinAmount),
          detail: `${formatCount(data.withdrawalSummary.pendingCount)} requests - ${currencyFormatter.format(data.withdrawalSummary.pendingMoneyAmount)}`,
          icon: "account_balance_wallet",
          tone: "secondary",
          href: "/admin/payouts",
        }
      : {
          id: "payouts",
          label: "Payouts Pending",
          value: "Unavailable",
          detail: "Withdrawal summary did not load",
          icon: "account_balance_wallet",
          tone: "secondary",
          href: "/admin/payouts",
          unavailable: true,
        },
    {
      id: "taxonomy",
      label: "Active Categories",
      value: formatCount(activeCategories),
      detail: `${formatCount(data.tags.length)} tags loaded, ${formatCount(pendingTags)} pending - ${formatCount(activePackages)} coin packages / ${formatCount(totalConfiguredCoins)} coins`,
      icon: "category",
      tone: "default",
      href: "/admin/categories",
    },
  ];
}

export function buildAdminPriorityActions(data: AdminDashboardData): AdminPriorityAction[] {
  const pendingTags = data.tags.filter(item => item.status === "pending").length;
  const inactiveCategories = data.categories.filter(item => item.status !== "active").length;
  const latestReport = data.reports[0];
  const latestWithdrawal = data.withdrawals[0];

  return [
    data.reportsSummary
      ? {
          id: "review-queue",
          label: "Review Queue",
          description: latestReport
            ? `${latestReport.title} - ${latestReport.reason}`
            : "No pending moderation items returned by media service.",
          href: "/admin/content/review",
          icon: "gavel",
          tone: "primary",
          countLabel: `${formatCount(data.reportsSummary.pendingReports)} pending`,
        }
      : {
          id: "review-queue",
          label: "Review Queue",
          description: "Moderation summary did not load.",
          href: "/admin/content/review",
          icon: "gavel",
          tone: "primary",
          countLabel: "Unavailable",
          unavailable: true,
        },
    data.withdrawalSummary
      ? {
          id: "payouts",
          label: "Approve Payouts",
          description: latestWithdrawal
            ? `${formatCount(latestWithdrawal.coinAmount)} AC requested by ${latestWithdrawal.userId}`
            : "No pending withdrawal items returned by finance service.",
          href: "/admin/payouts",
          icon: "monetization_on",
          tone: "secondary",
          countLabel: `${formatCount(data.withdrawalSummary.pendingCount)} requests`,
        }
      : {
          id: "payouts",
          label: "Approve Payouts",
          description: "Withdrawal summary did not load.",
          href: "/admin/payouts",
          icon: "monetization_on",
          tone: "secondary",
          countLabel: "Unavailable",
          unavailable: true,
        },
    {
      id: "verifications",
      label: "Verifications",
      description: "Identity service v1 has no creator verification workflow/table yet.",
      href: "/admin/verifications",
      icon: "verified",
      tone: "muted",
      countLabel: "API needed",
      unavailable: true,
    },
    {
      id: "taxonomy",
      label: "Taxonomy Health",
      description: "Real media-service data for tags and categories.",
      href: "/admin/categories",
      icon: "sell",
      tone: "muted",
      countLabel: `${formatCount(pendingTags)} pending tags / ${formatCount(inactiveCategories)} inactive categories`,
    },
  ];
}
