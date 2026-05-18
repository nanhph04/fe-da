import { redirect } from "next/navigation";
import "server-only";

import { getServerSessionProfile } from "@/shared/api/server";

export interface ServerUserProfile {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: number;
  gender?: "male" | "women" | "female" | null;
  birthday?: string | null;
  role: "user" | "viewer" | "creator" | "admin";
  isCreator: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getServerUserProfile() {
  return getServerSessionProfile();
}

export async function requireAuthenticatedUser(redirectPath: string) {
  try {
    return await getServerUserProfile();
  } catch {
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }
}

export async function redirectAdminFromMain() {
  let profile: ServerUserProfile | null = null;

  try {
    profile = await getServerUserProfile();
  } catch {
    return;
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }
}

export async function requireMainAccess(redirectPath: string) {
  const profile = await requireAuthenticatedUser(redirectPath);

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return profile;
}

export async function requireStudioAccess(redirectPath: string) {
  const profile = await requireAuthenticatedUser(redirectPath);
  const canAccessStudio = profile.role === "creator" || profile.isCreator;

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (!canAccessStudio) {
    redirect("/unauthorized");
  }

  return profile;
}

export async function requireAdminAccess() {
  const profile = await requireAuthenticatedUser("/admin");

  if (profile.role !== "admin") {
    redirect("/library");
  }

  return profile;
}
