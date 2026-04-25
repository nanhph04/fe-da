import { api } from "@/shared/utils/apiClient";

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isCreator: boolean;
  status: string;
  createdAt: string;
  [key: string]: any;
}

export const authService = {
  // 1.1) Register
  register: async (data: Record<string, any>) => {
    return api.post<null>("/api/auth/register", data);
  },

  // 1.2) Verify Email
  verifyEmail: async (data: { email: string; otp: string; password?: string }) => {
    return api.post<null>("/api/auth/verify-email", data);
  },

  // 1.3) Login
  login: async (data: Record<string, any>) => {
    return api.post<TokenResponse>("/api/auth/login", data);
  },

  // 1.5) Resend OTP
  resendOtp: async (data: { email: string; type?: string }) => {
    return api.post<null>("/api/auth/resend-otp", data);
  },

  // 1.6) Forgot Password
  forgotPassword: async (data: { email: string }) => {
    return api.post<null>("/api/auth/forgot-password", data);
  },

  // 1.7) Reset Password
  resetPassword: async (data: Record<string, any>) => {
    return api.post<null>("/api/auth/reset-password", data);
  },

  // 1.8) Change Password
  changePassword: async (data: Record<string, any>) => {
    return api.post<null>("/api/auth/change-password", data, { requireAuth: true });
  },

  // 1.9) Logout
  logout: async () => {
    return api.post<null>("/api/auth/logout", {}, { requireAuth: true });
  },

  // Lấy Profile hiện tại (để load User Context)
  getProfile: async () => {
    return api.get<UserProfileResponse>("/api/user/users/profile", { requireAuth: true });
  },

  // Cập nhật Profile
  updateProfile: async (data: { 
    displayName?: string; 
    avatarUrl?: string; 
    bio?: string; 
    phone?: number; 
    gender?: "male" | "women" | "female"; 
    birthday?: string 
  }) => {
    return api.patch<UserProfileResponse>("/api/user/users/profile", data, { requireAuth: true });
  },
};
