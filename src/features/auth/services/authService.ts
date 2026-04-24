import { api } from "@/shared/utils/apiClient";

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export const authService = {
  // 1.1) Register
  register: async (data: any) => {
    return api.post<any>("/api/auth/register", data);
  },

  // 1.2) Verify Email
  verifyEmail: async (data: any) => {
    return api.post<any>("/api/auth/verify-email", data);
  },

  // 1.3) Login
  login: async (data: any) => {
    return api.post<TokenResponse>("/api/auth/login", data);
  },

  // 1.5) Resend OTP
  resendOtp: async (data: any) => {
    return api.post<any>("/api/auth/resend-otp", data);
  },

  // 1.6) Forgot Password
  forgotPassword: async (data: any) => {
    return api.post<any>("/api/auth/forgot-password", data);
  },

  // 1.7) Reset Password
  resetPassword: async (data: any) => {
    return api.post<any>("/api/auth/reset-password", data);
  },

  // 1.8) Change Password
  changePassword: async (data: any) => {
    return api.post<any>("/api/auth/change-password", data, { requireAuth: true });
  },

  // 1.9) Logout
  logout: async () => {
    return api.post<any>("/api/auth/logout", {}, { requireAuth: true });
  },

  // Lấy Profile hiện tại (để load User Context)
  getProfile: async () => {
    return api.get<any>("/api/user/users/profile", { requireAuth: true });
  },
};
