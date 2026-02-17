import { useEffect, useRef } from "react";

interface UniversalWidgetLoaderProps {
  htmlCode: string;
}

export const UniversalWidgetLoader = ({ htmlCode }: UniversalWidgetLoaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlCode) return;

    // Container leeren
    containerRef.current.innerHTML = "";

    // HTML-String in echtes DOM verwandeln
    const range = document.createRange();
    range.selectNodeContents(containerRef.current);
    const fragment = range.createContextualFragment(htmlCode);

    // Skripte extrahieren und separat ausführen (sonst laufen sie in React nicht)
    const scripts: HTMLScriptElement[] = [];
    
    fragment.querySelectorAll("script").forEach((origScript) => {
      const newScript = document.createElement("script");
      
      // Attribute kopieren (src, id, data-attributes, etc.)
      Array.from(origScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Inline Code kopieren
      if (origScript.innerHTML) {
        newScript.innerHTML = origScript.innerHTML;
      }

      scripts.push(newScript);
      origScript.remove(); // Entfernen aus dem Fragment, damit es nicht doppelt ist
    });

    // 1. Das reine HTML (divs, styles) einfügen
    containerRef.current.appendChild(fragment);

    // 2. Die Skripte in den Body feuern (damit sie laden)
    scripts.forEach((script) => {
      document.body.appendChild(script);
    });

    // Cleanup: Skripte entfernen, wenn User die Seite verlässt
    return () => {
      scripts.forEach((script) => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
  }, [htmlCode]);

  return (
    <div 
      ref={containerRef} 
      className="universal-widget-wrapper w-full min-h-[500px] bg-white rounded-xl overflow-hidden" 
    />
  );
};