import { api } from "@/shared/api/client";

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export type UserRole = "user" | "creator" | "viewer" | "admin";

export interface MessageResponse {
  message: string;
}

export interface UserProfileResponse {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: number;
  gender?: "male" | "women" | "female";
  birthday?: string;
  role: UserRole;
  isCreator: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  phone?: number;
  gender?: "male" | "women" | "female";
  birthday?: string;
}



export const authService = {
  // 1.1) Register
  register: async (data: RegisterRequest) => {
    return api.post<MessageResponse>("/api/auth/register", data);
  },

  // 1.2) Verify Email
  verifyEmail: async (data: { email: string; otp: string }) => {
    return api.post<MessageResponse>("/api/auth/verify-email", data);
  },

  // 1.3) Login. Refresh token is set via httpOnly cookie; response body only contains accessToken/expiresIn.
  login: async (data: LoginRequest) => {
    return api.post<TokenResponse>("/api/auth/login", data);
  },

  // 1.5) Resend OTP
  resendOtp: async (data: { email: string; type: "register" | "forgot" }) => {
    return api.post<MessageResponse>("/api/auth/resend-otp", data);
  },

  // 1.6) Forgot Password
  forgotPassword: async (data: { email: string }) => {
    return api.post<MessageResponse>("/api/auth/forgot-password", data);
  },

  // 1.7) Reset Password
  resetPassword: async (data: ResetPasswordRequest) => {
    return api.post<MessageResponse>("/api/auth/reset-password", data);
  },

  // 1.8) Change Password
  changePassword: async (data: ChangePasswordRequest) => {
    return api.post<MessageResponse>("/api/auth/change-password", data, { requireAuth: true });
  },

  // 1.10) Logout
  logout: async () => {
    return api.post<MessageResponse>("/api/auth/logout", undefined, {
      requireAuth: true,
      suppressAuthRedirect: true,
    });
  },

  // Lấy session profile bằng refresh_token cookie, không rotate token và không trả accessToken.
  getSessionProfile: async () => {
    return api.get<UserProfileResponse>("/api/auth/session/profile");
  },

  // Lấy Profile hiện tại (để load User Context)
  getProfile: async () => {
    return api.get<UserProfileResponse>("/api/user/users/profile", { requireAuth: true });
  },

  // Cập nhật Profile. avatarUrl không được cập nhật qua endpoint này.
  updateProfile: async (data: UpdateProfileRequest) => {
    return api.patch<UserProfileResponse>("/api/user/users/profile", data, { requireAuth: true });
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return api.post<UserProfileResponse>(
      "/api/user/users/profile/avatar/upload-url",
      formData,
      { requireAuth: true }
    );
  },
};
