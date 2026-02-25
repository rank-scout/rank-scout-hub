import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  
  // Flag, um zu verhindern, dass wir "0" speichern, während wir noch versuchen wiederherzustellen
  const isRestoring = useRef(false);

  // 1. Browser-Automatik killen
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Scroll-Position speichern (aber NICHT während des Wiederherstellens)
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoring.current) return; // Blockiere Speichern beim Laden
      
      // Speichere unter dem spezifischen Pfad
      sessionStorage.setItem(`scroll-pos-${pathname}`, window.scrollY.toString());
    };

    // 'passive' für Performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // 3. Die aggressive "Brute Force" Wiederherstellung
  useEffect(() => {
    // A: Bei Anker-Links (#)
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        return;
      }
    }

    // B: Wenn User "Zurück" drückt (POP)
    if (navigationType === "POP") {
      const savedPos = sessionStorage.getItem(`scroll-pos-${pathname}`);
      
      if (savedPos) {
        const yTarget = parseInt(savedPos, 10);
        isRestoring.current = true; // LOCK: Nicht speichern, wir arbeiten noch!

        // INTERVALL: Wir hämmern den Scroll-Befehl alle 50ms rein, bis es klappt
        // (Das fängt den Moment ab, wo Supabase die Daten noch lädt)
        let attempts = 0;
        const intervalId = setInterval(() => {
          attempts++;
          
          // Versuch zu scrollen
          window.scrollTo(0, yTarget);

          // Check: Sind wir da? (Toleranz von 10px) oder Timeout (nach 2 Sek)
          const arrived = Math.abs(window.scrollY - yTarget) < 20;
          const pageIsTooShortButWeTried = document.documentElement.scrollHeight < yTarget && attempts > 40;

          if (arrived || pageIsTooShortButWeTried || attempts > 50) {
            clearInterval(intervalId);
            // Schloss wieder öffnen nach kurzem Delay
            setTimeout(() => { isRestoring.current = false; }, 200);
          }
        }, 50);

        return;
      }
    }

    // C: Normale Navigation -> Nach oben
    window.scrollTo(0, 0);
    
  }, [pathname, hash, navigationType]);

  return null;
};