'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Nutzt eure vorhandene Toaster-Library

interface StarRatingWidgetProps {
  slug: string;
}

export function StarRatingWidget({ slug }: StarRatingWidgetProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Doppelter Schutz: LocalStorage Check im Browser
    const voted = localStorage.getItem(`rs_voted_${slug}`);
    if (voted) setHasVoted(true);
  }, [slug]);

  const handleVote = async (stars: number) => {
    if (hasVoted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('increment_page_rating', {
        page_slug: slug,
        submitted_stars: stars,
      });

      if (error) throw error;

      // Die RPC gibt ein JSON zurück. Wir prüfen, ob es geklappt hat.
      const response = data as { success: boolean; message: string };
      
      if (response.success) {
        localStorage.setItem(`rs_voted_${slug}`, 'true');
        setHasVoted(true);
        toast.success('Danke für deine Bewertung!');
      } else {
        // Falls die IP in der DB schon existiert (Missbrauchsschutz hat gegriffen)
        setHasVoted(true);
        localStorage.setItem(`rs_voted_${slug}`, 'true');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center my-10 max-w-2xl mx-auto">
        <p className="text-slate-700 font-medium text-lg">Vielen Dank für dein Feedback!</p>
        <p className="text-sm text-slate-500 mt-2">
          Deine Bewertung hilft uns, die redaktionellen Inhalte auf Rank-Scout täglich zu verbessern.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center my-10 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-[#0A0F1C] mb-2">
        Wie hilfreich war dieser redaktionelle Überblick für dich?
      </h3>
      <p className="text-sm text-slate-500 mb-6">Klicke auf die Sterne, um unseren Content zu bewerten.</p>
      
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleVote(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={isSubmitting}
            className="transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
            aria-label={`${star} Sterne vergeben`}
          >
            <Star
              className={`w-10 h-10 ${
                (hoveredStar ?? 0) >= star
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-300'
              } transition-colors`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
}