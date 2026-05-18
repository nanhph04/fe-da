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
  { label: "explore", icon: "explore", path: "/", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "library", icon: "video_library", path: "/library", roles: ["guest", "viewer", "creator", "admin"] },
];

export const sideNavItems: NavItem[] = [
  { label: "explore", icon: "explore", path: "/", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "library", icon: "video_library", path: "/library", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "wallet", icon: "account_balance_wallet", path: "/wallet", roles: ["viewer", "creator", "admin"] },
  { label: "profile", icon: "person", path: "/profile", roles: ["viewer", "creator", "admin"] },
  { label: "purchased", icon: "payments", path: "/library/purchased", roles: ["viewer", "creator", "admin"] },
  { label: "subscriptions", icon: "subscriptions", path: "/library/subscriptions", roles: ["viewer", "creator", "admin"] },
];

export const mobileNavItems: NavItem[] = [
  { label: "explore", icon: "explore", path: "/", roles: ["guest", "viewer", "creator", "admin"] },
  { label: "library", icon: "video_library", path: "/library", roles: ["guest", "viewer", "creator", "admin"] },
];

export const studioEntryByRole: Partial<Record<MainNavRole, NavItem>> = {
  viewer: { label: "become_creator", icon: "sync_alt", path: "/onboarding" },
  creator: { label: "creator_studio", icon: "dashboard", path: "/studio" },
  admin: { label: "admin_panel", icon: "admin_panel_settings", path: "/admin" },
};

export const sideNavFooterItems: NavItem[] = [
  // { label: "settings", icon: "settings", disabled: true, roles: ["guest", "viewer", "creator", "admin"] },
  // { label: "help", icon: "help_outline", disabled: true, roles: ["guest", "viewer", "creator", "admin"] },
];

export { platformBrand };

export const isNavItemVisible = (item: NavItem, role: MainNavRole) => {
  return !item.roles || item.roles.includes(role);
};
