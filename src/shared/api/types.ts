export interface ApiError {
  success?: false;
  statusCode?: number;
  /** @deprecated Use statusCode for HTTP status. Kept while older services still return code. */
  code?: number;
  message?: string;
  /** @deprecated Use message. Kept while older services still return mess. */
  mess?: string;
  data?: null;
  errorCode?: string;
  requestId?: string;
  timestamp?: string;
  path?: string;
  errors?: string[];
  /** @deprecated Use statusCode. Kept for thrown/custom errors. */
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
  statusCode: number;
  /** @deprecated Use statusCode for HTTP status. Kept while older services still return code. */
  code?: number;
  data: T;
  message?: string;
  /** @deprecated Use message. Kept while older services still return mess. */
  mess?: string;
  errorCode?: string;
  errors?: string[];
  pagination?: ApiPagination;
}

export type ApiResponseType = "json" | "text" | "blob";

export interface ApiRequestInit extends RequestInit {
  requireAuth?: boolean;
  responseType?: ApiResponseType;
  suppressAuthRedirect?: boolean;
}
