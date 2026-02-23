import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTopHandler() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType(); // Sagt uns: PUSH, REPLACE oder POP

  useEffect(() => {
    // Wenn der User auf den "Zurück"-Button im Browser klickt (POP),
    // brechen wir hier ab und lassen den Browser die Scroll-Position wiederherstellen.
    if (navigationType === "POP") {
      return;
    }

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
    // Szenario 2: Normaler Seitenwechsel (Neuer Klick) ohne Anker -> Nach oben
    else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, navigationType]); 

  return null;
}