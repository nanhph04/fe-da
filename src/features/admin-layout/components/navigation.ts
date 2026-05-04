export interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
  disabled?: boolean;
  matchStartsWith?: boolean;
}

export const adminSidebarItems: AdminNavItem[] = [
  { label: "Overview", path: "/admin", icon: "dashboard" },
  { label: "User Management", path: "/admin/users", icon: "group", matchStartsWith: true },
  { label: "Verification", path: "/admin/verifications", icon: "verified", matchStartsWith: true },
  { label: "Content Review", path: "/admin/content", icon: "movie", matchStartsWith: true },
  { label: "Categories", path: "/admin/categories", icon: "category", matchStartsWith: true },
  { label: "Payouts & Revenue", path: "/admin/payouts", icon: "payments", matchStartsWith: true },
  { label: "Audit Logs", path: "/admin/audit", icon: "history", disabled: true },
];

export const adminFooterItems: AdminNavItem[] = [
  { label: "Config", path: "/admin/settings", icon: "settings" },
];
