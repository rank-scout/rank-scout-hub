import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const isRestoring = useRef(false);

  // 1. Browser-Automatik deaktivieren
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2. Speichern beim Verlassen (Besser als Scroll-Listener!)
  // Wir speichern die Position, kurz bevor sich der Pfad ändert.
  useEffect(() => {
    const savePos = () => {
      if (!isRestoring.current) {
        sessionStorage.setItem(`scroll-pos-${pathname}`, window.scrollY.toString());
      }
    };
    // Speichern bevor die Komponente unmountet (also Seite gewechselt wird)
    return () => savePos();
  }, [pathname]);

  // 3. Intelligente Wiederherstellung
  useEffect(() => {
    const handleRestore = async () => {
      // A: Hash / Anker
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      // B: Back-Button (POP)
      if (navigationType === "POP") {
        const savedPos = sessionStorage.getItem(`scroll-pos-${pathname}`);
        const yTarget = savedPos ? parseInt(savedPos, 10) : 0;

        if (yTarget > 0) {
          isRestoring.current = true;
          
          let attempts = 0;
          const maxAttempts = 50; // ca. 2.5 Sekunden

          const checkAndScroll = setInterval(() => {
            attempts++;
            
            // WICHTIG: Prüfen, ob die Seite überhaupt schon lang genug ist!
            const currentDocHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;

            // Wir können nur scrollen, wenn der Content da ist
            if (currentDocHeight >= yTarget + viewportHeight || attempts > 40) {
                window.scrollTo(0, yTarget);
            }

            // Haben wir das Ziel erreicht? (Mit Toleranz für Mobile Bars)
            if (Math.abs(window.scrollY - yTarget) < 50 || attempts >= maxAttempts) {
              clearInterval(checkAndScroll);
              isRestoring.current = false;
            }
          }, 50);
          
          return; 
        }
      }

      // C: Neuer Seitenaufruf (PUSH)
      window.scrollTo(0, 0);
    };

    handleRestore();
  }, [pathname, hash, navigationType]);

  return null;
};