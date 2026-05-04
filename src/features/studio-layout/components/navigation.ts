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
  { label: "Monetization", path: "/studio/wallet", icon: "payments", matchStartsWith: true },
  { label: "Memberships", path: "/studio/memberships", icon: "stars", matchStartsWith: true },
  { label: "Analytics", path: "/studio/analytics", icon: "analytics", disabled: true },
];

export const studioQuickLinks = studioSidebarItems.filter((item) =>
  ["/studio/content", "/studio/memberships", "/studio/wallet"].includes(item.path),
);
