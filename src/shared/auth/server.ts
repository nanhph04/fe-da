import "server-only";

import { redirect } from "next/navigation";
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

export async function requireStudioAccess(redirectPath: string) {
  const profile = await requireAuthenticatedUser(redirectPath);
  const canAccessStudio =
    profile.role === "admin" || profile.role === "creator" || profile.isCreator;

  if (!canAccessStudio) {
    redirect("/unauthorized");
  }

  return profile;
}
