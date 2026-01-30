import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white animate-in fade-in duration-300">
      {/* Glow Effect Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Animated Logo/Icon */}
        <div className="relative">
            <div className="absolute inset-0 bg-secondary/40 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-12 h-12 text-secondary animate-spin relative z-10" />
        </div>
        
        {/* Text mit Typing-Charakter oder Fade */}
        <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-display font-bold tracking-wider text-white">RANK SCOUT</h2>
            <p className="text-xs text-slate-400 uppercase tracking-[0.2em] animate-pulse">System wird geladen...</p>
        </div>
      </div>
    </div>
  );
};