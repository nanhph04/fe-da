// Global types shared across the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'STUDIO' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PRIVATE';
  createdAt: string;
  updatedAt: string;
  studioId?: string;
}

export interface ErrorWithMessage {
  message: string;
  code?: string;
  details?: any;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Common filter types
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface SearchFilters extends DateRange {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}