"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { api, fetchSSE, getHttpStatus, refreshAccessToken } from "@/shared/api/client";
import { authService } from "../services/authService";
import { useRouter } from "@/i18n/routing";
import { normalizeInternalPath } from "@/shared/utils/locale-path";
import { getSessionRevocationReason } from "./session-events";

import { UserProfileResponse } from "../services/authService";

export type UserProfile = UserProfileResponse;

interface AuthContextProps {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileIncomplete: boolean;
  getPostAuthRedirect: () => string;
  setAuthData: (token: string, userData?: UserProfile) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isProfileIncomplete = !!user && user.role !== "admin" && !user.displayName;

  const getPostAuthRedirect = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (!user.displayName) return "/onboarding/profile";
    return "/library";
  };

  const forceLogout = useCallback((reason = "account-disabled") => {
    api.clearToken();
    setUser(null);

    const params = new URLSearchParams({ reason });

    if (reason === "session-expired" && typeof window !== "undefined") {
      const currentPath = normalizeInternalPath(`${window.location.pathname}${window.location.search}`);
      const currentPathname = normalizeInternalPath(window.location.pathname);

      if (currentPath && currentPathname !== "/login") {
        params.set("redirect", currentPath);
      }
    }

    router.push(`/login?${params.toString()}`);
  }, [router]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
    } catch {
      api.clearToken();
      setUser(null);
    }
    return null;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = api.getToken();
        if (!token) {
          const newToken = await refreshAccessToken();
          api.setToken(newToken);
        }

        await fetchProfile();
      } catch {
        api.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, [fetchProfile]);

  const setAuthData = async (token: string, userData?: UserProfile) => {
    api.setToken(token);
    if (userData) {
      setUser(userData);
      return userData;
    }
    return fetchProfile();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API failed, forcing local logout", error);
    } finally {
      api.clearToken();
      setUser(null);
      router.push("/");
    }
  };

  useEffect(() => {
    if (!user || !api.getToken()) {
      return;
    }

    const controller = new AbortController();

    void fetchSSE(
      "/api/auth/session/events",
      { requireAuth: true, signal: controller.signal },
      (data, event) => {
        const logoutReason = getSessionRevocationReason(data, event);
        if (!logoutReason) {
          return;
        }

        forceLogout(logoutReason);
      },
      undefined,
      (error) => {
        const status = getHttpStatus(error);
        if (status === 401 || status === 403) {
          forceLogout(status === 403 ? "account-disabled" : "session-expired");
        }
      },
    );

    return () => {
      controller.abort();
    };
  }, [forceLogout, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isProfileIncomplete,
        getPostAuthRedirect,
        setAuthData,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
