import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface C4FRegistrationProps {
  partnerCode?: string;
}

const C4FRegistration = ({ partnerCode = "PLACEHOLDER_CODE" }: C4FRegistrationProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const cfrRef = useRef<Window["cfr"] | null>(null);

  // Generate years for birthday select (18+ years ago to 80 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 63 }, (_, i) => currentYear - 18 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "01", label: "Januar" },
    { value: "02", label: "Februar" },
    { value: "03", label: "März" },
    { value: "04", label: "April" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Dezember" },
  ];

  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    const initializeC4F = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load jQuery first
        await loadScript("https://api.cash4flirt.com/js/jquery.min.js");
        
        // Wait a bit for jQuery to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Then load register.js
        await loadScript("https://api.cash4flirt.com/js/register.js");

        // Wait for register.js to initialize
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Initialize C4fRegister
        if (window.C4fRegister) {
          const cfr = new window.C4fRegister({
            code: partnerCode,
            onSuccess: (data) => {
              console.log("C4F Registration success:", data);
            },
            onError: (err) => {
              console.error("C4F Registration error:", err);
              setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
            },
          });
          cfrRef.current = cfr;
          window.cfr = cfr;
          setScriptsLoaded(true);
        } else {
          throw new Error("C4fRegister class not found");
        }
      } catch (err) {
        console.error("Error loading C4F scripts:", err);
        setError("Fehler beim Laden der Registrierung. Bitte lade die Seite neu.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeC4F();

    // Cleanup
    return () => {
      cfrRef.current = null;
    };
  }, [partnerCode]);

  const handleRegister = () => {
    if (cfrRef.current) {
      cfrRef.current.registerUser();
    } else if (window.cfr) {
      window.cfr.registerUser();
    } else {
      setError("Registrierung nicht verfügbar. Bitte lade die Seite neu.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-display text-center">
          Kostenlos registrieren
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nick">Nickname</Label>
            <Input
              id="nick"
              name="nick"
              type="text"
              placeholder="Dein Nickname"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Dein Passwort"
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="deine@email.de"
              disabled={isLoading}
            />
          </div>

          {/* Birthday */}
          <div className="space-y-2">
            <Label>Geburtstag</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select disabled={isLoading}>
                <SelectTrigger id="birthday_day">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day.toString().padStart(2, "0")}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select disabled={isLoading}>
                <SelectTrigger id="birthday_month">
                  <SelectValue placeholder="Monat" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select disabled={isLoading}>
                <SelectTrigger id="birthday_year">
                  <SelectValue placeholder="Jahr" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Hidden combined birthday field for the API */}
            <input type="hidden" id="birthday" name="birthday" />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">Stadt</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Deine Stadt"
              disabled={isLoading}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Geschlecht</Label>
            <Select disabled={isLoading}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Geschlecht wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m">Mann</SelectItem>
                <SelectItem value="w">Frau</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search preference */}
          <div className="space-y-2">
            <Label htmlFor="search">Ich suche</Label>
            <Select disabled={isLoading}>
              <SelectTrigger id="search">
                <SelectValue placeholder="Was suchst du?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m">Männer</SelectItem>
                <SelectItem value="w">Frauen</SelectItem>
                <SelectItem value="mw">Beide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox id="agb" disabled={isLoading} />
            <Label htmlFor="agb" className="text-sm leading-tight cursor-pointer">
              Ich akzeptiere die{" "}
              <a href="/agb" className="text-primary hover:underline">
                AGB
              </a>{" "}
              und{" "}
              <a href="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </a>
            </Label>
          </div>

          {/* Register button */}
          <Button
            type="button"
            className="w-full mt-4"
            onClick={handleRegister}
            disabled={isLoading || !scriptsLoaded}
          >
            {isLoading ? "Lädt..." : "Jetzt registrieren"}
          </Button>

          {!scriptsLoaded && !isLoading && !error && (
            <p className="text-xs text-muted-foreground text-center">
              Registrierung wird vorbereitet...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default C4FRegistration;
