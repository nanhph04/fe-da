const SUPPORTED_LOCALE_PATTERN = /^\/(vi|en)(?=\/|$)/;

const AUTH_ENTRY_PATHS = ["/login", "/register"];

const splitPathSuffix = (path: string) => {
  const suffixStart = path.search(/[?#]/);

  if (suffixStart === -1) {
    return { pathname: path, suffix: "" };
  }

  return {
    pathname: path.slice(0, suffixStart) || "/",
    suffix: path.slice(suffixStart),
  };
};

export const getLocalePrefixFromPathname = (pathname?: string | null) => {
  const match = pathname?.match(SUPPORTED_LOCALE_PATTERN);
  return match ? `/${match[1]}` : "";
};

export const stripLocalePrefixFromPathname = (pathname: string) => {
  let strippedPathname = pathname;

  while (SUPPORTED_LOCALE_PATTERN.test(strippedPathname)) {
    strippedPathname = strippedPathname.replace(SUPPORTED_LOCALE_PATTERN, "") || "/";
  }

  return strippedPathname;
};

export const normalizeInternalPath = (path?: string | null) => {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return null;
  }

  const { pathname, suffix } = splitPathSuffix(path);
  return `${stripLocalePrefixFromPathname(pathname)}${suffix}`;
};

export const getSafeInternalRedirectPath = (path?: string | null) => {
  const normalizedPath = normalizeInternalPath(path);

  if (!normalizedPath) {
    return null;
  }

  const { pathname } = splitPathSuffix(normalizedPath);
  const isAuthEntryPath = AUTH_ENTRY_PATHS.some(
    (entryPath) => pathname === entryPath || pathname.startsWith(`${entryPath}/`),
  );

  return isAuthEntryPath ? null : normalizedPath;
};

export const buildLocalizedHref = (path: string, currentPathname?: string | null) => {
  const localePrefix = getLocalePrefixFromPathname(currentPathname);
  return `${localePrefix}${path}`;
};
