import { useEffect } from "react";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";

export const GlobalAnalytics = () => {
  const analyticsCode = useGlobalAnalyticsCode();

  useEffect(() => {
    if (!analyticsCode) return;
    
    // Create a unique identifier for our analytics script container
    const containerId = "global-analytics-scripts";
    
    // Remove existing analytics scripts if any
    const existingContainer = document.getElementById(containerId);
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Also remove any previously added analytics scripts
    const existingScripts = document.querySelectorAll('script[data-analytics="true"]');
    existingScripts.forEach(script => script.remove());
    
    // Create a temporary container to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = analyticsCode;
    
    // Extract and execute script tags
    const scripts = tempDiv.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.setAttribute("data-analytics", "true");
      
      // Copy all attributes
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (script.innerHTML) {
        newScript.innerHTML = script.innerHTML;
      }
      
      document.head.appendChild(newScript);
    });
    
    return () => {
      // Cleanup: remove added scripts
      const addedScripts = document.querySelectorAll('script[data-analytics="true"]');
      addedScripts.forEach(script => script.remove());
    };
  }, [analyticsCode]);

  return null;
};
