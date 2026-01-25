import type { ForumThread } from "@/hooks/useForum";

interface ForumJsonLdProps {
  threads: ForumThread[];
}

/**
 * FAQPage Schema for Forum Threads (SEO)
 * Renders JSON-LD structured data for search engines
 */
export function ForumJsonLd({ threads }: ForumJsonLdProps) {
  if (!threads || threads.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": threads.map((thread) => ({
      "@type": "Question",
      "name": thread.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": thread.content.substring(0, 500), // Truncate for schema
      },
      "dateCreated": thread.created_at,
      "author": {
        "@type": "Person",
        "name": thread.author_name,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

/**
 * BreadcrumbList Schema
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

/**
 * Organization Schema
 */
export function OrganizationJsonLd({ name, url, logo, description }: OrganizationJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    ...(logo && { "logo": logo }),
    ...(description && { "description": description }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
