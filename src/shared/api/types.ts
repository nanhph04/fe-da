export interface ApiError {
  success?: boolean;
  code?: number;
  mess?: string;
  message?: string;
  errors?: string[];
  status?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data: T;
  mess: string;
  errors?: string[];
}

export type ApiResponseType = "json" | "text" | "blob";

export interface ApiRequestInit extends RequestInit {
  requireAuth?: boolean;
  responseType?: ApiResponseType;
}
