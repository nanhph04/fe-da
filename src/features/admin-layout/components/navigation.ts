import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Boxes,
  CircleDollarSign,
  FileClock,
  Film,
  Gauge,
  Landmark,
  LifeBuoy,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  labelKey: string;
  path: string;
  icon: LucideIcon;
  disabled?: boolean;
  matchStartsWith?: boolean;
}

export const adminSidebarItems: AdminNavItem[] = [
  { labelKey: "dashboard", path: "/admin", icon: Gauge },
  { labelKey: "contentReview", path: "/admin/content", icon: Film, matchStartsWith: true },
  { labelKey: "users", path: "/admin/users", icon: Users, matchStartsWith: true },
  { labelKey: "channels", path: "/admin/channels", icon: Boxes, matchStartsWith: true },
  { labelKey: "membershipReview", path: "/admin/verifications", icon: ShieldCheck, matchStartsWith: true },
  { labelKey: "categories", path: "/admin/categories", icon: SlidersHorizontal, matchStartsWith: true },
  { labelKey: "finance", path: "/admin/finance", icon: CircleDollarSign, matchStartsWith: true },
  { labelKey: "payouts", path: "/admin/payouts", icon: Banknote, matchStartsWith: true }
];

export const adminFooterItems: AdminNavItem[] = [
  { labelKey: "systemSettings", path: "/admin/settings", icon: Settings },
  { labelKey: "contentPolicies", path: "/admin/settings/policies", icon: FileClock, matchStartsWith: true },
  { labelKey: "support", path: "/admin/support", icon: LifeBuoy, disabled: true },
  { labelKey: "viewLivePlatform", path: "/", icon: Landmark },
];
