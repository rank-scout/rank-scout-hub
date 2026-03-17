import { useMemo } from "react";
import ProjectListEmbed from "./ProjectListEmbed";
import type { Category } from "@/hooks/useCategories";
import type { ProjectWithCategory } from "@/hooks/useProjects";
import { sanitizeCmsHtml } from "@/lib/sanitizeHtml";

interface CustomHtmlRendererProps {
  category: Category;
  projects: ProjectWithCategory[];
  htmlContent: string;
}

const CONTENT_PROSE_CLASSNAME =
  "custom-html-content prose prose-slate max-w-none " +
  "prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-[#0A0F1C] " +
  "prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-li:leading-relaxed " +
  "prose-a:text-orange-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 " +
  "prose-blockquote:bg-orange-50/50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl " +
  "prose-table:w-full prose-table:text-sm prose-th:bg-slate-50 prose-th:text-slate-900 prose-th:text-left " +
  "prose-th:font-bold prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3 " +
  "prose-img:rounded-2xl prose-img:border prose-img:border-slate-200 prose-img:shadow-md";

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

  return (
    <div className="custom-html-override w-full m-0 p-0">
      {beforeApps && (
        <article
          className={CONTENT_PROSE_CLASSNAME}
          dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(beforeApps) }}
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
        <article
          className={CONTENT_PROSE_CLASSNAME}
          dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(afterApps) }}
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
