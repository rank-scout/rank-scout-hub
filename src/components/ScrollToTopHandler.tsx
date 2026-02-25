import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  
  // Ref für die aktuelle Position, damit wir sie beim Cleanup haben
  const scrollPosRef = useRef(0);

  // Scroll-Position tracken (ohne State-Rerender)
  useLayoutEffect(() => {
    const updatePos = () => {
      scrollPosRef.current = window.scrollY;
    };
    window.addEventListener("scroll", updatePos);
    return () => window.removeEventListener("scroll", updatePos);
  }, []);

  // Speichern beim Cleanup (Unmount)
  useLayoutEffect(() => {
    return () => {
      sessionStorage.setItem(`scroll-pos-${pathname}`, scrollPosRef.current.toString());
    };
  }, [pathname]);

  // Restore Logik
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) element.scrollIntoView();
      return;
    }

    if (navigationType === "POP") {
      const savedPos = sessionStorage.getItem(`scroll-pos-${pathname}`);
      if (savedPos) {
        const y = parseInt(savedPos, 10);
        // Sofort hart setzen vor dem Paint
        window.scrollTo(0, y);
        
        // Sicherungsschuss nach kurzem Delay für Mobile Safari
        requestAnimationFrame(() => {
             window.scrollTo(0, y);
        });
        return;
      }
    }

    // PUSH
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};