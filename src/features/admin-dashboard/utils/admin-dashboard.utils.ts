import type { useTranslations } from "next-intl";
import type { AdminDashboardData, AdminPriorityAction, AdminStatCard } from "../types/admin-dashboard.types";

type TFunction = ReturnType<typeof useTranslations>;

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "VND",
});

export function formatCount(value: number): string {
  return numberFormatter.format(value);
}

function formatPercent(t: TFunction, value: number | null): string {
  if (value === null) {
    return t("utils.growthUnavailable");
  }

  return t("utils.percent30Days", { value: `${value >= 0 ? "+" : ""}${value.toFixed(1)}` });
}

export function buildAdminStatCards(data: AdminDashboardData, t: TFunction): AdminStatCard[] {
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
          label: t("stats.users.label"),
          value: formatCount(data.usersSummary.totalUsers),
          detail: t("stats.users.detail", {
            active: formatCount(data.usersSummary.activeUsers30d),
            growth: formatPercent(t, data.usersSummary.growth30dPercent),
          }),
          icon: "groups",
          tone: "default",
          href: "/admin/users",
        }
      : {
          id: "users",
          label: t("stats.users.label"),
          value: t("common.unavailable"),
          detail: t("stats.users.unavailableDetail"),
          icon: "groups",
          tone: "default",
          href: "/admin/users",
          unavailable: true,
        },
    data.channelsSummary
      ? {
          id: "creators",
          label: t("stats.creators.label"),
          value: formatCount(data.channelsSummary.activeCreators30d),
          detail: t("stats.creators.detail", {
            reviews: formatCount(data.channelsSummary.membershipPendingReview),
            uploading: formatCount(data.channelsSummary.uploadingNow),
          }),
          icon: "movie_edit",
          tone: "primary",
          href: "/admin/verifications",
        }
      : {
          id: "creators",
          label: t("stats.creators.label"),
          value: t("common.unavailable"),
          detail: t("stats.creators.unavailableDetail"),
          icon: "movie_edit",
          tone: "primary",
          href: "/admin/channels",
          unavailable: true,
        },
    data.reportsSummary
      ? {
          id: "moderation",
          label: t("stats.moderation.label"),
          value: formatCount(data.reportsSummary.pendingReports),
          detail: t("stats.moderation.detail", {
            manual: formatCount(data.reportsSummary.pendingManualReviewVideos),
            flagged: formatCount(data.reportsSummary.autoFlaggedVideos),
          }),
          icon: "warning",
          tone: "warning",
          href: "/admin/content/review",
        }
      : {
          id: "moderation",
          label: t("stats.moderation.label"),
          value: t("common.unavailable"),
          detail: t("stats.moderation.unavailableDetail"),
          icon: "warning",
          tone: "warning",
          href: "/admin/content/review",
          unavailable: true,
        },
    data.withdrawalSummary
      ? {
          id: "payouts",
          label: t("stats.payouts.label"),
          value: formatCount(data.withdrawalSummary.pendingCoinAmount),
          detail: t("stats.payouts.detail", {
            requests: formatCount(data.withdrawalSummary.pendingCount),
            amount: currencyFormatter.format(data.withdrawalSummary.pendingMoneyAmount),
          }),
          icon: "account_balance_wallet",
          tone: "secondary",
          href: "/admin/payouts",
        }
      : {
          id: "payouts",
          label: t("stats.payouts.label"),
          value: t("common.unavailable"),
          detail: t("stats.payouts.unavailableDetail"),
          icon: "account_balance_wallet",
          tone: "secondary",
          href: "/admin/payouts",
          unavailable: true,
        },
    data.videoSummary
      ? {
          id: "videos",
          label: t("stats.videos.label"),
          value: formatCount(data.videoSummary.totalVideos),
          detail: t("stats.videos.detail", {
            total: formatCount(data.videoSummary.totalVideos),
            views: formatCount(data.videoSummary.totalViews),
            newViews: formatCount(data.videoSummary.newViews),
            period: data.videoSummary.period === "day"
              ? t("utils.periodDay")
              : data.videoSummary.period === "week"
              ? t("utils.periodWeek")
              : data.videoSummary.period === "month"
              ? t("utils.periodMonth")
              : t("utils.periodAll"),
          }),
          icon: "movie",
          tone: "default",
          href: "/admin/content",
        }
      : {
          id: "videos",
          label: t("stats.videos.label"),
          value: t("common.unavailable"),
          detail: t("stats.videos.unavailableDetail"),
          icon: "movie",
          tone: "default",
          href: "/admin/content",
          unavailable: true,
        },
    {
      id: "taxonomy",
      label: t("stats.taxonomy.label"),
      value: formatCount(activeCategories),
      detail: t("stats.taxonomy.detail", {
        tags: formatCount(data.tags.length),
        pendingTags: formatCount(pendingTags),
        packages: formatCount(activePackages),
        coins: formatCount(totalConfiguredCoins),
      }),
      icon: "category",
      tone: "default",
      href: "/admin/categories",
    },
  ];
}

export function buildAdminPriorityActions(data: AdminDashboardData, t: TFunction): AdminPriorityAction[] {
  const pendingTags = data.tags.filter(item => item.status === "pending").length;
  const inactiveCategories = data.categories.filter(item => item.status !== "active").length;
  const latestReport = data.reports[0];
  const latestWithdrawal = data.withdrawals[0];

  return [
    data.channelsSummary
      ? {
          id: "membership-review",
          label: t("actions.membershipReview.label"),
          description: t("actions.membershipReview.description", {
            approved: formatCount(data.channelsSummary.membershipApproved),
            rejected: formatCount(data.channelsSummary.membershipRejected),
          }),
          href: "/admin/verifications",
          icon: "verified_user",
          tone: "primary",
          countLabel: t("actions.counts.pending", { count: formatCount(data.channelsSummary.membershipPendingReview) }),
        }
      : {
          id: "membership-review",
          label: t("actions.membershipReview.label"),
          description: t("actions.membershipReview.unavailableDescription"),
          href: "/admin/verifications",
          icon: "verified_user",
          tone: "primary",
          countLabel: t("common.unavailable"),
          unavailable: true,
        },
    data.reportsSummary
      ? {
          id: "review-queue",
          label: t("actions.reviewQueue.label"),
          description: latestReport
            ? `${latestReport.title} - ${latestReport.reason}`
            : t("actions.reviewQueue.emptyDescription"),
          href: "/admin/content/review",
          icon: "gavel",
          tone: "primary",
          countLabel: t("actions.counts.pending", { count: formatCount(data.reportsSummary.pendingReports) }),
        }
      : {
          id: "review-queue",
          label: t("actions.reviewQueue.label"),
          description: t("actions.reviewQueue.unavailableDescription"),
          href: "/admin/content/review",
          icon: "gavel",
          tone: "primary",
          countLabel: t("common.unavailable"),
          unavailable: true,
        },
    data.withdrawalSummary
      ? {
          id: "payouts",
          label: t("actions.approvePayouts.label"),
          description: latestWithdrawal
            ? t("actions.approvePayouts.description", {
                amount: formatCount(latestWithdrawal.coinAmount),
                userId: latestWithdrawal.userId,
              })
            : t("actions.approvePayouts.emptyDescription"),
          href: "/admin/payouts",
          icon: "monetization_on",
          tone: "secondary",
          countLabel: t("actions.counts.requests", { count: formatCount(data.withdrawalSummary.pendingCount) }),
        }
      : {
          id: "payouts",
          label: t("actions.approvePayouts.label"),
          description: t("actions.approvePayouts.unavailableDescription"),
          href: "/admin/payouts",
          icon: "monetization_on",
          tone: "secondary",
          countLabel: t("common.unavailable"),
          unavailable: true,
        },
    {
      id: "taxonomy",
      label: t("actions.taxonomy.label"),
      description: t("actions.taxonomy.description"),
      href: "/admin/categories",
      icon: "sell",
      tone: "muted",
      countLabel: t("actions.taxonomy.countLabel", {
        pendingTags: formatCount(pendingTags),
        inactiveCategories: formatCount(inactiveCategories),
      }),
    },
  ];
}
