import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Boxes,
  CircleDollarSign,
  FileClock,
  Film,
  Gauge,
  History,
  Landmark,
  LifeBuoy,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  disabled?: boolean;
  matchStartsWith?: boolean;
}

export const adminSidebarItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: Gauge },
  { label: "Content Review", path: "/admin/content", icon: Film, matchStartsWith: true },
  { label: "Users", path: "/admin/users", icon: Users, matchStartsWith: true },
  { label: "Channels", path: "/admin/channels", icon: Boxes, matchStartsWith: true },
  { label: "Verification", path: "/admin/verifications", icon: ShieldCheck, matchStartsWith: true },
  { label: "Categories", path: "/admin/categories", icon: SlidersHorizontal, matchStartsWith: true },
  { label: "Finance", path: "/admin/finance", icon: CircleDollarSign, matchStartsWith: true },
  { label: "Payouts", path: "/admin/payouts", icon: Banknote, matchStartsWith: true },
  { label: "Logs", path: "/admin/audit", icon: History, disabled: true },
];

export const adminFooterItems: AdminNavItem[] = [
  { label: "System Settings", path: "/admin/settings", icon: Settings },
  { label: "Content Policies", path: "/admin/settings/policies", icon: FileClock, matchStartsWith: true },
  { label: "Support", path: "/admin/support", icon: LifeBuoy, disabled: true },
  { label: "View Live Platform", path: "/landing", icon: Landmark },
];
