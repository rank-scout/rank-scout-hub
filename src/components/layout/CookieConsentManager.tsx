import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Cookie, Shield, BarChart3, Megaphone, Settings2 } from "lucide-react";

export function CookieConsentManager() {
  const {
    consent,
    isVisible,
    acceptAll,
    acceptEssentialOnly,
    updateConsent,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [localConsent, setLocalConsent] = useState({
    functional: consent?.functional ?? false,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  });

  if (!isVisible) return null;

  const handleSaveSelection = () => {
    updateConsent(localConsent);
    setShowDetails(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/50">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-white mb-1">
                  Cookie-Einstellungen
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Wir nutzen Cookies, um Ihnen das beste Erlebnis zu bieten. 
                  Wählen Sie Ihre Präferenzen oder akzeptieren Sie alle Cookies.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={acceptAll}
                className="flex-1 min-w-[140px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25"
              >
                Alle akzeptieren
              </Button>
              <Button
                onClick={acceptEssentialOnly}
                variant="outline"
                className="flex-1 min-w-[140px] border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Nur essenzielle
              </Button>
              <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Settings2 className="w-4 h-4" />
                    Anpassen
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display text-white">
                      Cookie-Einstellungen anpassen
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Essential - Always On */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <Label className="text-white font-medium">Essenziell</Label>
                          <p className="text-xs text-slate-400 mt-1">
                            Erforderlich für die Grundfunktion der Website.
                          </p>
                        </div>
                      </div>
                      <Switch checked disabled className="data-[state=checked]:bg-green-600" />
                    </div>

                    {/* Functional */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Settings2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <Label htmlFor="functional" className="text-white font-medium">Funktional</Label>
                          <p className="text-xs text-slate-400 mt-1">
                            Speichert Einstellungen wie Sprache und Region.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="functional"
                        checked={localConsent.functional}
                        onCheckedChange={(checked) => setLocalConsent(prev => ({ ...prev, functional: checked }))}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>

                    {/* Analytics */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <Label htmlFor="analytics" className="text-white font-medium">Analyse</Label>
                          <p className="text-xs text-slate-400 mt-1">
                            Hilft uns, die Website zu verbessern (Google Analytics).
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="analytics"
                        checked={localConsent.analytics}
                        onCheckedChange={(checked) => setLocalConsent(prev => ({ ...prev, analytics: checked }))}
                        className="data-[state=checked]:bg-amber-600"
                      />
                    </div>

                    {/* Marketing */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <Label htmlFor="marketing" className="text-white font-medium">Marketing</Label>
                          <p className="text-xs text-slate-400 mt-1">
                            Personalisierte Werbung und Remarketing.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="marketing"
                        checked={localConsent.marketing}
                        onCheckedChange={(checked) => setLocalConsent(prev => ({ ...prev, marketing: checked }))}
                        className="data-[state=checked]:bg-pink-600"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveSelection}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                    >
                      Auswahl speichern
                    </Button>
                    <Button
                      onClick={() => {
                        acceptAll();
                        setShowDetails(false);
                      }}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Alle akzeptieren
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Legal Links */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <a href="/datenschutz" className="hover:text-slate-300 transition-colors">Datenschutz</a>
              <span>•</span>
              <a href="/impressum" className="hover:text-slate-300 transition-colors">Impressum</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
