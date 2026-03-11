import { useMemo } from "react";
import DOMPurify from "dompurify";
import ProjectListEmbed from "./ProjectListEmbed";
import type { Category } from "@/hooks/useCategories";
import type { ProjectWithCategory } from "@/hooks/useProjects";

interface CustomHtmlRendererProps {
  category: Category;
  projects: ProjectWithCategory[];
  htmlContent: string;
}

export default function CustomHtmlRenderer({
  category,
  projects,
  htmlContent,
}: CustomHtmlRendererProps) {
  const { beforeApps, afterApps, hasPlaceholder } = useMemo(() => {
    const placeholder = "{{APPS}}";
    const index = htmlContent.indexOf(placeholder);

    if (index === -1) {
      return {
        beforeApps: htmlContent,
        afterApps: "",
        hasPlaceholder: false,
      };
    }

    return {
      beforeApps: htmlContent.substring(0, index),
      afterApps: htmlContent.substring(index + placeholder.length),
      hasPlaceholder: true,
    };
  }, [htmlContent]);

  const sanitizeHtml = (html: string) => {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "a", "ul", "ol", "li",
        "strong", "em", "b", "i", "u", "br",
        "span", "div", "img",
        "table", "thead", "tbody", "tr", "th", "td",
        "blockquote", "pre", "code", "details", "summary"
      ],
      ALLOWED_ATTR: [
        "href", "target", "rel", "class", "id",
        "src", "alt", "title", "width", "height", "style"
      ],
      ADD_ATTR: ["target"],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ["script", "iframe", "style", "object", "embed", "noscript", "form", "input", "button"],
      FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onmouseout"],
    });
  };

  return (
    <div className="custom-html-override w-full m-0 p-0">
      {beforeApps && (
        <div
          className="custom-html-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(beforeApps) }}
        />
      )}

      {hasPlaceholder && (
        <ProjectListEmbed
          projects={projects}
          categoryName={category.name}
          theme={category.theme}
        />
      )}

      {afterApps && (
        <div
          className="custom-html-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(afterApps) }}
        />
      )}

      {!hasPlaceholder && projects.length > 0 && (
        <ProjectListEmbed
          projects={projects}
          categoryName={category.name}
          theme={category.theme}
        />
      )}
    </div>
  );
}