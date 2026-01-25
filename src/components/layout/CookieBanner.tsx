import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setIsVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary/95 border-t border-white/10 p-4 z-[9999] backdrop-blur-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="text-secondary w-6 h-6" />
          <p className="text-sm text-slate-300">
            Wir nutzen Cookies, um Rank-Scout zu optimieren. Mit dem Klick auf "Akzeptieren" stimmst du der Nutzung zu.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-xs" onClick={() => setIsVisible(false)}>Ablehnen</Button>
          <Button variant="secondary" onClick={accept}>Akzeptieren</Button>
        </div>
      </div>
    </div>
  );
};