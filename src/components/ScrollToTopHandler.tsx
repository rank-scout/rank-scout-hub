import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTopHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Szenario 1: Es gibt einen Anker (z.B. #forum)
    if (hash) {
      // Das # entfernen, um die ID zu bekommen
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      
      if (element) {
        // Kleiner Timeout hilft, falls React das Element erst noch rendern muss
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } 
    // Szenario 2: Normaler Seitenwechsel ohne Anker -> Nach oben
    else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]); // Trigger feuert bei Pfad- ODER Hash-Änderung

  return null;
}