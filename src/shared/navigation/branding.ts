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
  { label: "Discover", path: "/landing" },
  { label: "Library", path: "/library" },
  { label: "Creator Studio", path: "/onboarding" },
];

export const publicAuthLinks: PublicNavLink[] = [
  { label: "Sign In", path: "/login" },
  { label: "Sign Up", path: "/register" },
];
