import DOMPurify from "dompurify";

const CMS_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "ul", "ol", "li",
  "strong", "em", "b", "i", "u",
  "a", "span", "div",
  "img", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "details", "summary", "code", "pre", "figure", "figcaption"
];

const CMS_ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "title",
  "class", "id",
  "colspan", "rowspan"
];

export function sanitizeCmsHtml(html?: string | null): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: CMS_ALLOWED_TAGS,
    ALLOWED_ATTR: CMS_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "script", "iframe", "object", "embed",
      "form", "input", "button", "textarea", "select",
      "style", "svg", "math"
    ],
  });
}

export function sanitizeCmsHtmlWithBreaks(html?: string | null): string {
  if (!html) return "";
  return sanitizeCmsHtml(String(html).replace(/\n/g, "<br/>"));
}

export function sanitizeForumHtml(html?: string | null): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: CMS_ALLOWED_TAGS,
    ALLOWED_ATTR: CMS_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "script", "iframe", "object", "embed",
      "form", "input", "button", "textarea", "select",
      "style", "svg", "math"
    ],
  });
}