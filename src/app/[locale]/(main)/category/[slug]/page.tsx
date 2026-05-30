import { setRequestLocale } from "next-intl/server";
import { CategoryFeature } from "@/features/discovery";
import {
  getCategoryBySlugCached,
  getCategoryVideosPageCached,
  getLatestVideosCached,
  getPublicVideosCached,
  getTagsCached,
  type CategoryPublic,
  type PublicDiscoveryVideo,
  type TagPublic,
} from "@/features/watch/services/publicMediaService";
import type { ApiPagination } from "@/shared/api/types";

const CATEGORY_PAGE_LIMIT = 20;
const LATEST_SLUG = "latest";

type CategoryPageParams = {
  locale: string;
  slug: string;
};

type CategorySearchParams = Record<string, string | string[] | undefined>;

type CategoryLookupResult = {
  category: CategoryPublic | null;
  error: string | null;
};

function getSearchValue(searchParams: CategorySearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseTags(value?: string) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))
  );
}

function getApiErrorStatus(error: unknown) {
  if (error && typeof error === "object") {
    const apiError = error as { statusCode?: number; code?: number; status?: number };
    return apiError.statusCode ?? apiError.status ?? apiError.code;
  }

  return undefined;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const apiError = error as { message?: string; mess?: string; errors?: string[] };
    return apiError.message || apiError.mess || apiError.errors?.join(", ") || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function resolveCategory(slug: string): Promise<CategoryLookupResult> {
  try {
    const category = await getCategoryBySlugCached(slug);
    return { category, error: null };
  } catch (error) {
    return {
      category: null,
      error: getApiErrorMessage(
        error,
        "Không thể tải thông tin thể loại từ Media Service."
      ),
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<CategoryPageParams>;
  searchParams: Promise<CategorySearchParams>;
}) {
  const [{ locale, slug: rawSlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  setRequestLocale(locale);

  const slug = rawSlug.trim();
  const isLatest = slug === LATEST_SLUG;
  const page = parsePage(getSearchValue(resolvedSearchParams, "page"));
  const q = getSearchValue(resolvedSearchParams, "q")?.trim() || "";
  const selectedTags = parseTags(getSearchValue(resolvedSearchParams, "tags"));
  const hasFilters = Boolean(q || selectedTags.length > 0);

  const [categoryResult, tagsResponse] = await Promise.all([
    isLatest ? Promise.resolve({ category: null, error: null }) : resolveCategory(slug),
    getTagsCached().catch(() => null),
  ]);

  const tags: TagPublic[] = tagsResponse?.success ? tagsResponse.data ?? [] : [];
  let videos: PublicDiscoveryVideo[] = [];
  let pagination: ApiPagination | null = null;
  let errorMessage = categoryResult.error;

  if (!slug) {
    errorMessage = "Đường dẫn thể loại không hợp lệ.";
  } else if (!isLatest && !categoryResult.category && !categoryResult.error) {
    errorMessage = "Không tìm thấy thể loại đang hoạt động cho đường dẫn này.";
  } else {
    try {
      if (isLatest && hasFilters) {
        const response = await getPublicVideosCached({
          q,
          tags: selectedTags,
          limit: CATEGORY_PAGE_LIMIT,
        });
        videos = response.success ? response.data ?? [] : [];
        if (!response.success) {
          errorMessage = response.message || "Không thể lọc danh sách video mới nhất.";
        }
      } else if (isLatest) {
        const response = await getLatestVideosCached(CATEGORY_PAGE_LIMIT);
        if (response.success) {
          videos = response.data ?? [];
        } else {
          errorMessage = response.message || "Không thể tải danh sách video mới nhất.";
        }
      } else if (hasFilters) {
        const response = await getPublicVideosCached({
          q,
          category: slug,
          tags: selectedTags,
          limit: CATEGORY_PAGE_LIMIT,
        });
        videos = response.success ? response.data ?? [] : [];
        if (!response.success) {
          errorMessage = response.message || "Không thể lọc video trong thể loại này.";
        }
      } else {
        const response = await getCategoryVideosPageCached(slug, page, CATEGORY_PAGE_LIMIT);
        videos = response.success ? response.data ?? [] : [];
        pagination = response.pagination ?? null;
        if (!response.success) {
          errorMessage = response.message || "Không thể tải video trong thể loại này.";
        }
      }
    } catch (error) {
      errorMessage =
        getApiErrorStatus(error) === 404
          ? "Không tìm thấy thể loại đang hoạt động cho đường dẫn này."
          : getApiErrorMessage(error, "Không thể tải dữ liệu thể loại lúc này.");
    }
  }

  return (
    <CategoryFeature
      slug={slug}
      category={categoryResult.category}
      videos={videos}
      tags={tags}
      pagination={pagination}
      filters={{ q, tags: selectedTags }}
      errorMessage={errorMessage}
      formAction={`/${locale}/category/${slug}`}
      isLatest={isLatest}
    />
  );
}
