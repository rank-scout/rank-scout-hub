import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTopHandler() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sobald sich der Pfad ändert -> Ab nach oben!
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Diese Komponente rendert nichts sichtbares
}