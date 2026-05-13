export interface StudioNavItem {
  label: string;
  path: string;
  icon: string;
  disabled?: boolean;
  matchStartsWith?: boolean;
}

export const studioSidebarItems: StudioNavItem[] = [
  { label: "Dashboard", path: "/studio", icon: "dashboard" },
  { label: "Content", path: "/studio/content", icon: "video_library", matchStartsWith: true },
  { label: "Upload", path: "/studio/upload", icon: "add_circle", matchStartsWith: true },
  { label: "Studio Wallet", path: "/studio/wallet", icon: "account_balance_wallet", matchStartsWith: true },
  { label: "Memberships", path: "/studio/memberships", icon: "stars", matchStartsWith: true },
];

export const studioQuickLinks: StudioNavItem[] = [
  { label: "Content", path: "/studio/content", icon: "video_library", matchStartsWith: true },
  { label: "Wallet", path: "/studio/wallet", icon: "account_balance_wallet", matchStartsWith: true },
  { label: "Earnings", path: "/studio/wallet/earnings", icon: "monitoring", matchStartsWith: true },
  { label: "Payouts", path: "/studio/wallet/payouts", icon: "payments", matchStartsWith: true },
  { label: "Memberships", path: "/studio/memberships", icon: "stars", matchStartsWith: true },
];
