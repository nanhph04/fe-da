export interface StudioNavItem {
  label: string;
  path: string;
  icon: string;
  disabled?: boolean;
  matchStartsWith?: boolean;
}

export const studioSidebarItems: StudioNavItem[] = [
  { label: "dashboard", path: "/studio", icon: "dashboard" },
  { label: "content", path: "/studio/content", icon: "video_library", matchStartsWith: true },
  { label: "upload", path: "/studio/upload", icon: "add_circle", matchStartsWith: true },
  { label: "studioWallet", path: "/studio/wallet", icon: "account_balance_wallet", matchStartsWith: true },
  { label: "memberships", path: "/studio/memberships", icon: "stars", matchStartsWith: true },
];

export const studioQuickLinks: StudioNavItem[] = [
  { label: "content", path: "/studio/content", icon: "video_library", matchStartsWith: true },
  { label: "wallet", path: "/studio/wallet", icon: "account_balance_wallet" },
  { label: "earnings", path: "/studio/wallet/earnings", icon: "monitoring", matchStartsWith: true },
  { label: "payouts", path: "/studio/wallet/payouts", icon: "payments", matchStartsWith: true },
  { label: "memberships", path: "/studio/memberships", icon: "stars", matchStartsWith: true },
];
