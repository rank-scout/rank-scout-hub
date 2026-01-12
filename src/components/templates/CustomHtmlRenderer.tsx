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

  // Sanitize HTML content - allow EVERYTHING for full override mode
  // This is an admin-only feature, so we trust the HTML input
  const sanitizeHtml = (html: string) => {
    // Configure DOMPurify to allow full HTML override including scripts and styles
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['style', 'link', 'meta', 'iframe', 'script', 'noscript'],
      ADD_ATTR: [
        'target', 'rel', 'style', 'class', 'id', 
        'data-*', 'aria-*', 'onclick', 'onload', 'onerror',
        'src', 'href', 'integrity', 'crossorigin', 'referrerpolicy',
        'type', 'async', 'defer', 'charset', 'name', 'content',
        'property', 'sizes', 'media', 'as', 'fetchpriority'
      ],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: true,
      // Allow inline styles completely
      FORCE_BODY: false,
      WHOLE_DOCUMENT: false,
    });
  };

  return (
    <div className="custom-html-override w-full m-0 p-0">
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