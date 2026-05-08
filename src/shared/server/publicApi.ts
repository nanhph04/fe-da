import "server-only";

export { fetchPublicApi } from "@/shared/api/server";
export type {
  ApiError as PublicApiError,
  ApiResponse as PublicApiResponse,
} from "@/shared/api/types";
