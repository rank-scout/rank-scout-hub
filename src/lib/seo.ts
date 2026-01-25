/**
 * SEO Helper Functions for Rank-Scout Hub
 * 
 * Title-Rule: Max 60 Zeichen, immer mit " | seaEQ" Suffix
 * Description-Rule: Max 155 Zeichen
 */

const SITE_SUFFIX = " | seaEQ";
const SUFFIX_LENGTH = SITE_SUFFIX.length; // 8 Zeichen

/**
 * Formatiert einen SEO-Titel mit automatischem Suffix
 * Max 60 Zeichen inklusive " | seaEQ"
 */
export function formatSeoTitle(title: string, maxLength = 60): string {
  const availableLength = maxLength - SUFFIX_LENGTH;
  
  if (title.length > availableLength) {
    // Truncate with ellipsis
    const truncated = title.substring(0, availableLength - 3).trim() + "...";
    return `${truncated}${SITE_SUFFIX}`;
  }
  
  return `${title}${SITE_SUFFIX}`;
}

/**
 * Formatiert eine SEO-Description
 * Max 155 Zeichen
 */
export function formatSeoDescription(description: string, maxLength = 155): string {
  if (description.length > maxLength) {
    return description.substring(0, maxLength - 3).trim() + "...";
  }
  return description;
}

/**
 * Generiert einen URL-freundlichen Slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}
