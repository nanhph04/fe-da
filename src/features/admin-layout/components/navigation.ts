export interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
  disabled?: boolean;
  matchStartsWith?: boolean;
}

export const adminSidebarItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: "dashboard" },
  { label: "Content Review", path: "/admin/content", icon: "movie", matchStartsWith: true },
  { label: "Users", path: "/admin/users", icon: "group", matchStartsWith: true },
  { label: "Verification", path: "/admin/verifications", icon: "verified", matchStartsWith: true },
  { label: "Categories", path: "/admin/categories", icon: "category", matchStartsWith: true },
  { label: "Finance", path: "/admin/payouts", icon: "payments", matchStartsWith: true },
  { label: "Logs", path: "/admin/audit", icon: "history", disabled: true },
];

export const adminFooterItems: AdminNavItem[] = [
  { label: "System Settings", path: "/admin/settings", icon: "settings", matchStartsWith: true },
  { label: "Content Policies", path: "/admin/settings/policies", icon: "policy", matchStartsWith: true },
];
