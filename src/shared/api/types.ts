export interface ApiError {
  success?: boolean;
  code?: number;
  mess?: string;
  message?: string;
  errors?: string[];
  status?: number;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data: T;
  mess: string;
  errors?: string[];
  pagination?: ApiPagination;
}

export type ApiResponseType = "json" | "text" | "blob";

export interface ApiRequestInit extends RequestInit {
  requireAuth?: boolean;
  responseType?: ApiResponseType;
}
