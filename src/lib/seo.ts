import { buildAbsoluteSiteUrl, normalizeRoutePath } from "@/lib/routes";

export const SEO_SITE_URL = "https://rank-scout.com";

const CANONICAL_DROP_PARAMS = new Set([
  "gclid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "srsltid",
  "subid",
  "sub_id",
  "subid1",
  "subid2",
  "affid",
  "affiliate_id",
  "sessionid",
  "session_id",
  "sid",
  "phpsessid",
  "ref",
  "refid",
  "source",
  "campaign",
]);

function isTrackingParam(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return normalized.startsWith("utm_") || CANONICAL_DROP_PARAMS.has(normalized);
}

export function sanitizeCanonicalSearch(rawSearch: string | undefined | null): string {
  if (!rawSearch) return "";

  const params = new URLSearchParams(rawSearch);
  const cleaned = new URLSearchParams();

  for (const [key, value] of params.entries()) {
    if (isTrackingParam(key)) continue;
    cleaned.append(key, value);
  }

  const serialized = cleaned.toString();
  return serialized ? `?${serialized}` : "";
}

export function buildCanonicalUrl(
  rawPathOrUrl: string,
  options?: {
    siteUrl?: string;
    preserveCleanQuery?: boolean;
  },
): string {
  const siteUrl = options?.siteUrl || SEO_SITE_URL;
  const preserveCleanQuery = options?.preserveCleanQuery === true;

  const isAbsolute = /^https?:\/\//i.test(rawPathOrUrl);
  const url = isAbsolute
    ? new URL(rawPathOrUrl)
    : new URL(buildAbsoluteSiteUrl(normalizeRoutePath(rawPathOrUrl), siteUrl));

  url.pathname = normalizeRoutePath(url.pathname);
  url.hash = "";
  url.search = preserveCleanQuery ? sanitizeCanonicalSearch(url.search) : "";

  return url.toString();
}

export function buildCanonicalUrlFromLocation(
  pathname: string,
  search: string = "",
  options?: {
    siteUrl?: string;
    preserveCleanQuery?: boolean;
  },
): string {
  return buildCanonicalUrl(
    `${normalizeRoutePath(pathname)}${options?.preserveCleanQuery ? sanitizeCanonicalSearch(search) : ""}`,
    options,
  );
}

export function safeSchemaId(url: string, suffix: string): string {
  return `${url.replace(/\/$/, "")}${suffix.startsWith("#") ? suffix : `#${suffix}`}`;
}

export function stripHtmlToPlainText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
