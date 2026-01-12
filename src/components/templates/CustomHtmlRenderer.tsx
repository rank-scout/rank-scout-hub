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

export default function CustomHtmlRenderer({ category, projects, htmlContent }: CustomHtmlRendererProps) {
  // Split the HTML at {{APPS}} placeholder
  const { beforeApps, afterApps, hasPlaceholder } = useMemo(() => {
    const placeholder = "{{APPS}}";
    const index = htmlContent.indexOf(placeholder);
    
    if (index === -1) {
      return {
        beforeApps: htmlContent,
        afterApps: "",
        hasPlaceholder: false
      };
    }
    
    return {
      beforeApps: htmlContent.substring(0, index),
      afterApps: htmlContent.substring(index + placeholder.length),
      hasPlaceholder: true
    };
  }, [htmlContent]);

  // Sanitize HTML content
  const sanitizeHtml = (html: string) => {
    // Configure DOMPurify to allow more elements for full HTML override
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['style', 'link', 'meta', 'iframe'],
      ADD_ATTR: ['target', 'rel', 'style', 'class', 'id', 'data-*', 'aria-*'],
      ALLOW_DATA_ATTR: true,
    });
  };

  return (
    <div className="custom-html-override">
      {/* Render HTML before {{APPS}} */}
      {beforeApps && (
        <div 
          className="custom-html-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(beforeApps) }}
        />
      )}
      
      {/* Render the React ProjectList component at {{APPS}} position */}
      {hasPlaceholder && (
        <ProjectListEmbed 
          projects={projects} 
          categoryName={category.name}
          theme={category.theme}
        />
      )}
      
      {/* Render HTML after {{APPS}} */}
      {afterApps && (
        <div 
          className="custom-html-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(afterApps) }}
        />
      )}
      
      {/* If no placeholder, still show the apps list at the end */}
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