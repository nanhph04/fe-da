"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/shared/api/client";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";

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

  const isProfileIncomplete = !!user && !user.displayName;

  const getPostAuthRedirect = () => {
    if (!user) return "/login";
    if (!user.displayName) return "/onboarding/profile";
    return "/library";
  };

  const fetchProfile = async () => {
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
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        await fetchProfile();
        setIsLoading(false);
        return;
      }

      try {
        const sessionRes = await authService.getSessionProfile();
        if (sessionRes.success && sessionRes.data) {
          setUser(sessionRes.data);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

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
      router.push("/login");
    }
  };

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
