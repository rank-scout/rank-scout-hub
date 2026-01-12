import { useEffect, useRef, useMemo } from "react";
import ProjectList from "./ProjectList";
import type { ProjectWithCategory } from "@/hooks/useProjects";

interface CustomHtmlRendererProps {
  htmlContent: string;
  projects: ProjectWithCategory[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Strict Custom HTML Override Renderer
 * - NO app components (Header/Footer/Layout)
 * - NO app styling interference
 * - Full head injection (styles, scripts, fonts, meta)
 * - Script re-execution after render
 * - {{APPS}} placeholder for dynamic project list
 */
export default function CustomHtmlRenderer({ 
  htmlContent, 
  projects,
  metaTitle,
  metaDescription
}: CustomHtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedElementsRef = useRef<Element[]>([]);

  // Parse HTML using DOMParser for robust extraction
  const { headHtml, bodyHtml, beforeApps, afterApps, hasPlaceholder } = useMemo(() => {
    // Create a DOM parser
    const parser = new DOMParser();
    
    // Clean doctype for parsing
    const cleanedHtml = htmlContent.replace(/<!DOCTYPE[^>]*>/gi, '');
    const doc = parser.parseFromString(cleanedHtml, "text/html");

    // Extract head content (styles, scripts, meta, links)
    const headContent = doc.head?.innerHTML || "";
    
    // Extract body content (or use full HTML if no body tag)
    let bodyContent = doc.body?.innerHTML || htmlContent;
    
    // If body is empty but we have content, use cleaned HTML directly
    if (!bodyContent.trim() && cleanedHtml.trim()) {
      // Remove html/head/body wrapper tags manually as fallback
      bodyContent = cleanedHtml
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    }

    // Split body at {{APPS}} placeholder
    const placeholder = "{{APPS}}";
    const placeholderIndex = bodyContent.indexOf(placeholder);
    
    if (placeholderIndex === -1) {
      return {
        headHtml: headContent,
        bodyHtml: bodyContent,
        beforeApps: bodyContent,
        afterApps: "",
        hasPlaceholder: false
      };
    }

    return {
      headHtml: headContent,
      bodyHtml: bodyContent,
      beforeApps: bodyContent.substring(0, placeholderIndex),
      afterApps: bodyContent.substring(placeholderIndex + placeholder.length),
      hasPlaceholder: true
    };
  }, [htmlContent]);

  // Inject head content (styles, fonts, meta, scripts)
  useEffect(() => {
    if (!headHtml) return;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = headHtml;

    const elementsToInject: Element[] = [];

    // Process each head element
    Array.from(tempContainer.children).forEach((element) => {
      const clone = element.cloneNode(true) as Element;
      clone.setAttribute("data-custom-override", "true");
      
      // Handle script tags specially - they need to be recreated
      if (clone.tagName === "SCRIPT") {
        const script = document.createElement("script");
        Array.from(clone.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        script.textContent = clone.textContent;
        script.setAttribute("data-custom-override", "true");
        document.head.appendChild(script);
        elementsToInject.push(script);
      } else {
        document.head.appendChild(clone);
        elementsToInject.push(clone);
      }
    });

    injectedElementsRef.current = elementsToInject;

    // Cleanup on unmount
    return () => {
      injectedElementsRef.current.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      injectedElementsRef.current = [];
    };
  }, [headHtml]);

  // Re-execute scripts in the body after render
  useEffect(() => {
    if (!containerRef.current) return;

    // Find all script tags in the container
    const scripts = containerRef.current.querySelectorAll("script");
    
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      
      // Copy all attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      newScript.textContent = oldScript.textContent;
      
      // Replace old script with new one to trigger execution
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [beforeApps, afterApps]);

  // Set SEO fallbacks if provided
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute("content");

    if (metaTitle) {
      document.title = metaTitle;
    }

    if (metaDescription) {
      let metaEl = document.querySelector('meta[name="description"]');
      if (!metaEl) {
        metaEl = document.createElement("meta");
        metaEl.setAttribute("name", "description");
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute("content", metaDescription);
    }

    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        document.querySelector('meta[name="description"]')?.setAttribute("content", originalDescription);
      }
    };
  }, [metaTitle, metaDescription]);

  // Reset body margin for full viewport control
  useEffect(() => {
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    const originalOverflow = document.body.style.overflowX;
    
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflowX = "hidden";

    return () => {
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
      document.body.style.overflowX = originalOverflow;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="custom-html-override"
    >
      {/* Render HTML before {{APPS}} */}
      <div dangerouslySetInnerHTML={{ __html: beforeApps }} />
      
      {/* Render neutral ProjectList at {{APPS}} position */}
      {hasPlaceholder && <ProjectList projects={projects} />}
      
      {/* Render HTML after {{APPS}} */}
      {afterApps && <div dangerouslySetInnerHTML={{ __html: afterApps }} />}
      
      {/* If no placeholder and we have projects, append at end */}
      {!hasPlaceholder && projects.length > 0 && (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
