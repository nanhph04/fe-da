import "server-only";

import { redirect } from "next/navigation";
import { fetchServerApi } from "@/shared/api/server";

export interface ServerUserProfile {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role: "viewer" | "creator" | "admin";
  isCreator: boolean;
}

export async function getServerUserProfile() {
  const response = await fetchServerApi<ServerUserProfile>(
    "/api/user/users/profile",
    {
      requireAuth: true,
      cache: "no-store",
    }
  );

  return response.data;
}

export async function requireAuthenticatedUser(redirectPath: string) {
  try {
    return await getServerUserProfile();
  } catch {
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
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
