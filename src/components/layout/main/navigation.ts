import type { UserRole } from "@/features/auth/services/authService";
import { platformBrand } from "@/shared/navigation/branding";

export type MainNavRole = UserRole | "guest";

export interface NavItem {
  label: string;
  icon: string;
  path?: string;
  disabled?: boolean;
  roles?: MainNavRole[];
}

export const topNavItems: NavItem[] = [
  { label: "Khám phá", icon: "explore", path: "/", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Library", icon: "video_library", path: "/library", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Wallet", icon: "account_balance_wallet", path: "/wallet", roles: ["viewer", "creator", "admin"] },
  { label: "Profile", icon: "person", path: "/profile", roles: ["viewer", "creator", "admin"] },
];

export const sideNavItems: NavItem[] = [
  { label: "Khám phá", icon: "explore", path: "/", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Library", icon: "video_library", path: "/library", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Wallet", icon: "account_balance_wallet", path: "/wallet", roles: ["viewer", "creator", "admin"] },
  { label: "Profile", icon: "person", path: "/profile", roles: ["viewer", "creator", "admin"] },
  { label: "Purchased", icon: "payments", path: "/library/purchased", roles: ["viewer", "creator", "admin"] },
  { label: "Subscriptions", icon: "subscriptions", path: "/library/subscriptions", roles: ["viewer", "creator", "admin"] },
];

export const mobileNavItems: NavItem[] = [
  { label: "Khám phá", icon: "explore", path: "/", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Library", icon: "video_library", path: "/library", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Wallet", icon: "account_balance_wallet", path: "/wallet", roles: ["viewer", "creator", "admin"] },
  { label: "Profile", icon: "person", path: "/profile", roles: ["viewer", "creator", "admin"] },
];

export const studioEntryByRole: Partial<Record<MainNavRole, NavItem>> = {
  viewer: { label: "Become Creator", icon: "sync_alt", path: "/onboarding" },
  creator: { label: "Creator Studio", icon: "dashboard", path: "/studio" },
  admin: { label: "Admin Panel", icon: "admin_panel_settings", path: "/admin" },
};

export const sideNavFooterItems: NavItem[] = [
  { label: "Settings", icon: "settings", disabled: true, roles: ["guest", "viewer", "creator", "admin"] },
  { label: "Help", icon: "help_outline", disabled: true, roles: ["guest", "viewer", "creator", "admin"] },
];

export { platformBrand };

export const isNavItemVisible = (item: NavItem, role: MainNavRole) => {
  return !item.roles || item.roles.includes(role);
};
