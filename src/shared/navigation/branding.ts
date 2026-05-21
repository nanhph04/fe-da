export const platformBrand = {
  name: "Velvet Gallery",
  shortName: "Velvet",
  icon: "play_arrow",
};

export interface PublicNavLink {
  label: string;
  path: string;
}

export const publicMarketingLinks: PublicNavLink[] = [
  { label: "Khám phá", path: "/" },
  { label: "Thư viện", path: "/library" },
];

export const publicAuthLinks: PublicNavLink[] = [
  { label: "Đăng nhập", path: "/login" },
  { label: "Đăng ký", path: "/register" },
];
