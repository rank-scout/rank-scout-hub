import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface C4FRegistrationProps {
  partnerCode?: string;
}

interface C4FInstance {
  registerUser: () => void;
  getInitData: () => void;
  showError: (msg: unknown) => void;
  registerUserSuccess: (data: unknown) => void;
}

declare global {
  interface Window {
    C4fRegister: new (config: { code: string }) => C4FInstance;
    cfr: C4FInstance | null;
    jQuery: unknown;
    $: unknown;
  }
}

// BUGFIX: Safe error message extraction - prevents React Error #31
const safeToastError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "Ein unbekannter Fehler ist aufgetreten.";
    }
  }
  return "Ein unbekannter Fehler ist aufgetreten.";
};

const C4FRegistration = ({ partnerCode = "PLACEHOLDER_CODE" }: C4FRegistrationProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const cfrRef = useRef<C4FInstance | null>(null);

  // Generate data for selects
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i); // 18 to 99 years ago
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "1", label: "Januar" },
    { value: "2", label: "Februar" },
    { value: "3", label: "März" },
    { value: "4", label: "April" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Dezember" },
  ];

  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(script);
      });
    };

    const initializeC4F = async () => {
      try {
        // Load jQuery first
        await loadScript("https://api.cash4flirt.com/js/jquery.min.js");
        await new Promise((r) => setTimeout(r, 100));

        // Then load register.js
        await loadScript("https://api.cash4flirt.com/js/register.js");
        await new Promise((r) => setTimeout(r, 200));

        // Initialize C4fRegister
        if (window.C4fRegister) {
          const cfr = new window.C4fRegister({ code: partnerCode });

          // Override showError - use safeToastError to prevent crash
          cfr.showError = (msg: unknown) => {
            const safeMsg = safeToastError(msg);
            toast({
              title: "Fehler",
              description: safeMsg,
              variant: "destructive",
            });
            setIsLoading(false);
          };

          // Override registerUserSuccess
          cfr.registerUserSuccess = () => {
            toast({
              title: "Erfolgreich!",
              description: "Deine Registrierung war erfolgreich.",
            });
            navigate("/welcome");
          };

          cfrRef.current = cfr;
          window.cfr = cfr;

          // Get initial data from API
          cfr.getInitData();

          setScriptsLoaded(true);
        } else {
          throw new Error("C4fRegister class not found");
        }
      } catch (err) {
        console.error("Error loading C4F scripts:", err);
        toast({
          title: "Ladefehler",
          description: safeToastError(err),
          variant: "destructive",
        });
      }
    };

    initializeC4F();

    return () => {
      cfrRef.current = null;
    };
  }, [partnerCode, navigate]);

  const handleRegister = async () => {
    setIsLoading(true);

    // SCHRITT A: Lead Capture - Fail-Safe (NEVER block user!)
    try {
      const emailInput = document.getElementById("email") as HTMLInputElement;
      const email = emailInput?.value?.trim();

      if (email) {
        const { error } = await supabase.from("subscribers").insert({
          email: email,
          source_page: "c4f-direct-signup",
          is_active: true,
        });

        if (error) {
          // 409 = duplicate, just log and continue
          console.warn("Lead capture skipped (may already exist):", error.message);
        } else {
          console.log("Lead captured successfully");
        }
      }
    } catch (err) {
      // NIEMALS blockieren - einfach weiter!
      console.warn("Lead capture failed, continuing:", err);
    }

    // SCHRITT B: C4F API aufrufen
    if (cfrRef.current) {
      cfrRef.current.registerUser();
    } else if (window.cfr) {
      window.cfr.registerUser();
    } else {
      toast({
        title: "Fehler",
        description: "Registrierung nicht verfügbar. Bitte lade die Seite neu.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Native input styling classes (matching Tailwind/shadcn look)
  const inputClassName =
    "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const selectClassName =
    "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const labelClassName = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-display text-center text-gradient-primary">
          Kostenlos registrieren
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Nickname */}
          <div className="space-y-2">
            <label htmlFor="nick" className={labelClassName}>Nickname</label>
            <input
              type="text"
              id="nick"
              name="nick"
              placeholder="Dein Nickname"
              disabled={isLoading}
              className={inputClassName}
            />
            <div className="invalid-feedback"></div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="pass" className={labelClassName}>Passwort</label>
            <input
              type="password"
              id="pass"
              name="pass"
              placeholder="Dein Passwort"
              disabled={isLoading}
              className={inputClassName}
            />
            <div className="invalid-feedback"></div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className={labelClassName}>E-Mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="deine@email.de"
              disabled={isLoading}
              className={inputClassName}
            />
            <div className="invalid-feedback"></div>
          </div>

          {/* Birthday - 3 Selects nebeneinander */}
          <div className="space-y-2">
            <label className={labelClassName}>Geburtstag</label>
            <div className="grid grid-cols-3 gap-2">
              <select id="day" name="day" disabled={isLoading} className={selectClassName}>
                <option value="">Tag</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <select id="month" name="month" disabled={isLoading} className={selectClassName}>
                <option value="">Monat</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select id="year" name="year" disabled={isLoading} className={selectClassName}>
                <option value="">Jahr</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="invalid-feedback"></div>
          </div>

          {/* Hidden Country field - API expects this */}
          <input type="hidden" id="country" name="country" value="DE" />

          {/* City */}
          <div className="space-y-2">
            <label htmlFor="city" className={labelClassName}>Stadt</label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="Deine Stadt"
              disabled={isLoading}
              className={inputClassName}
            />
            <div className="invalid-feedback"></div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label htmlFor="gender" className={labelClassName}>Ich bin</label>
            <select id="gender" name="gender" disabled={isLoading} className={selectClassName}>
              <option value="">Geschlecht wählen</option>
              <option value="m">Mann</option>
              <option value="w">Frau</option>
            </select>
            <div className="invalid-feedback"></div>
          </div>

          {/* Search preference */}
          <div className="space-y-2">
            <label htmlFor="gender_search" className={labelClassName}>Ich suche</label>
            <select id="gender_search" name="gender_search" disabled={isLoading} className={selectClassName}>
              <option value="">Was suchst du?</option>
              <option value="m">Mann</option>
              <option value="w">Frau</option>
            </select>
            <div className="invalid-feedback"></div>
          </div>

          {/* Terms checkbox - NATIVE INPUT for API compatibility! */}
          <div className="flex items-start space-x-3 pt-2">
            <input
              type="checkbox"
              id="conditions"
              name="conditions"
              disabled={isLoading}
              className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <label htmlFor="conditions" className="text-sm leading-tight cursor-pointer text-muted-foreground">
              Ich akzeptiere die{" "}
              <a href="/agb" className="text-primary hover:underline">
                AGB
              </a>{" "}
              und{" "}
              <a href="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </a>
            </label>
          </div>
          <div className="invalid-feedback"></div>

          {/* Register button */}
          <Button
            type="button"
            className="w-full mt-4 bg-primary-gradient hover:opacity-90 transition-opacity"
            onClick={handleRegister}
            disabled={isLoading || !scriptsLoaded}
          >
            {isLoading ? "Registrierung läuft..." : scriptsLoaded ? "Kostenlos registrieren" : "Wird geladen..."}
          </Button>

          {!scriptsLoaded && (
            <p className="text-xs text-muted-foreground text-center animate-pulse">
              Registrierung wird vorbereitet...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default C4FRegistration;
