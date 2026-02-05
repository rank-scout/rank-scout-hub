import { useWeightedApps } from "@/hooks/usePromotedApps";
import { useTickerConfig } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AltArrowRight, Star, GraphUp } from '@solar-icons/react';
import { Link } from "react-router-dom";

export const AppTicker = () => {
  const { data: apps, isLoading } = useWeightedApps(15); 
  const { linkText } = useTickerConfig();

  if (isLoading) return <div className="py-12 container"><Skeleton className="h-32 w-full rounded-2xl" /></div>;
  if (!apps || apps.length === 0) return null;

  const scrollingApps = [...apps, ...apps];

  return (
    <div className="w-full bg-slate-50/50 border-b border-slate-200 py-12 overflow-hidden relative">
      
      {/* Header Bereich */}
      <div className="container mx-auto px-4 mb-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
         <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                LIVE: Trend Apps letzte 24h
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary flex items-center justify-center md:justify-start gap-3">
              <GraphUp weight="Bold" className="w-7 h-7 text-primary" /> 
              Top Apps & Deals
            </h2>
         </div>
         <Link to="/top-apps" className="text-sm font-bold text-primary hover:text-secondary transition-all flex items-center gap-2 group">
           {linkText}
           <AltArrowRight weight="Bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </Link>
      </div>

      {/* Ticker Container */}
      <div className="relative w-full overflow-hidden mask-gradient-x">
        <div className="flex w-max animate-scroll hover:pause gap-6 px-6 py-4">
          {scrollingApps.map((app, index) => (
            <div
                key={`${app.id}-${index}`}
                className="w-[260px] flex-shrink-0 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-primary/20 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-500 group cursor-pointer hover:-translate-y-2 hover:scale-[1.02]"
            >
                {/* App Logo - Zentriert & Größer */}
                <div className="w-20 h-20 mb-5 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden p-2 group-hover:shadow-lg transition-shadow">
                    {app.logo_url ? (
                        <img src={app.logo_url} alt={app.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-3xl">📱</span>
                    )}
                </div>
                
                {/* App Info - Zentriert */}
                <div className="space-y-2 mb-6">
                    <h3 className="font-bold text-primary text-lg truncate w-full px-2 group-hover:text-secondary transition-colors">
                      {app.name}
                    </h3>
                    <div className="flex flex-col items-center gap-1">
                        {/* Rating mit dem richtigen Hero-Orange (secondary) */}
                        <div className="flex gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              weight="Bold" 
                              className={`w-3.5 h-3.5 ${i < Math.round(app.rating || 5) ? 'text-secondary' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          {app.category || "Premium App"}
                        </span>
                    </div>
                </div>

                {/* Action Button - Erscheint beim Hover prominent */}
                <Button 
                  size="sm" 
                  className="w-full rounded-xl bg-slate-50 text-slate-500 group-hover:bg-primary group-hover:text-white transition-all font-bold border-none"
                  asChild
                >
                    <a href={app.affiliate_link || "#"} target="_blank" rel="noopener noreferrer">
                        Details ansehen
                    </a>
                </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile Link Integration */}
      <div className="container mx-auto px-4 mt-10 md:hidden">
        <Button variant="outline" className="w-full rounded-2xl border-slate-200 text-primary font-bold h-12" asChild>
          <Link to="/top-apps">{linkText}</Link>
        </Button>
      </div>

    </div>
  );
};