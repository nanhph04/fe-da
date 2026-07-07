import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import "server-only";

import { fetchServerApi, getServerSessionProfile } from "@/shared/api/server";
import {
  buildLockedStudioRedirectPath,
  isLockedChannelStatus,
} from "@/shared/auth/studio-access";

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

type ServerCurrentChannel = {
  channelId: string;
  status: string;
};

async function getForwardedCookieHeader() {
  const headerStore = await headers();
  const headerCookie = headerStore.get("cookie");
  if (headerCookie) {
    return headerCookie;
  }

  const cookieStore = await cookies();
  const serialized = cookieStore.toString();
  return serialized || null;
}

async function getLockedStudioRedirectPath() {
  const cookieHeader = await getForwardedCookieHeader();
  if (!cookieHeader) {
    return null;
  }

  try {
    const channelResponse = await fetchServerApi<ServerCurrentChannel>("/api/media/me/channel", {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (isLockedChannelStatus(channelResponse.data?.status)) {
      return buildLockedStudioRedirectPath(channelResponse.data?.channelId);
    }
  } catch {
    return null;
  }

  return null;
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
    // Creator access can lag briefly after channel creation while auth state syncs.
    // Send users back to onboarding so the client-side sync flow can recover them.
    redirect("/onboarding?studioAccess=pending");
  }

  const lockedStudioRedirectPath = await getLockedStudioRedirectPath();
  if (lockedStudioRedirectPath) {
    redirect(lockedStudioRedirectPath);
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
