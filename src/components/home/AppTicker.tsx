import { useWeightedApps } from "@/hooks/usePromotedApps";
import { useTickerConfig } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
// HIER KORRIGIERT: 'GraphUp' statt 'TrendingUp'
import { AltArrowRight, Star, GraphUp } from '@solar-icons/react';
import { Link } from "react-router-dom";

export const AppTicker = () => {
  const { data: apps, isLoading } = useWeightedApps(15); 
  const { badge, headline, linkText } = useTickerConfig();

  if (isLoading) return <div className="py-8 container"><Skeleton className="h-20 w-full rounded-xl" /></div>;
  if (!apps || apps.length === 0) return null;

  const scrollingApps = [...apps, ...apps];

  return (
    <div className="w-full bg-white border-b border-slate-200 py-8 overflow-hidden relative">
      
      {/* Header Bereich */}
      <div className="container mx-auto px-4 mb-6 flex flex-col sm:flex-row justify-between items-end gap-2">
         <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {badge}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              {/* HIER KORRIGIERT: GraphUp verwendet */}
              <GraphUp weight="Bold" className="w-6 h-6 text-primary" /> 
              {headline}
            </h2>
         </div>
         <Link to="/top-apps" className="text-sm font-medium text-primary hover:text-secondary transition-colors hidden sm:block">
           {linkText}
         </Link>
      </div>

      {/* Ticker Container */}
      <div className="relative w-full overflow-hidden mask-gradient-x">
        <div className="flex w-max animate-scroll hover:pause gap-4 px-4 py-2">
          {scrollingApps.map((app, index) => (
            <div
                key={`${app.id}-${index}`}
                className="w-[280px] flex-shrink-0 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 rounded-xl p-4 flex items-center gap-4 transition-all group"
            >
                <div className="w-12 h-12 flex-shrink-0 bg-slate-50 rounded-lg p-1 border border-slate-100 flex items-center justify-center overflow-hidden">
                    {app.logo_url ? (
                        <img src={app.logo_url} alt={app.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-2xl">📱</span>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{app.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star weight="Bold" className="w-3 h-3 fill-current text-secondary" /> {app.rating?.toFixed(1) || "5.0"}
                        </span>
                        <span className="truncate max-w-[80px]">{app.category || "App"}</span>
                    </div>
                </div>

                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 rounded-full" asChild>
                    <a href={app.affiliate_link || "#"} target="_blank" rel="noopener noreferrer" title="Zum Anbieter">
                        <AltArrowRight weight="Bold" className="w-4 h-4" />
                    </a>
                </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile Link */}
      <div className="container mx-auto px-4 mt-4 sm:hidden text-center">
        <Link to="/top-apps" className="text-sm font-bold text-primary border border-primary/20 py-2 px-4 rounded-full inline-block w-full">
          {linkText}
        </Link>
      </div>
    </div>
  );
};