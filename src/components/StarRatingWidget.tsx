'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StarRatingWidgetProps {
  slug: string;
}

export function StarRatingWidget({ slug }: StarRatingWidgetProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    const voted = localStorage.getItem(`rs_voted_${slug}`);
    setHasVoted(!!voted); 
    fetchStats();
  }, [slug]);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('page_ratings')
      .select('seed_total_stars, seed_vote_count, real_total_stars, real_vote_count')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[StarRatingWidget] Fetch error:', error);
      setStats({ avg: 0, count: 0 });
      return;
    }

    if (data) {
      const totalStars = Number(data.seed_total_stars || 0) + Number(data.real_total_stars || 0);
      const totalVotes = Number(data.seed_vote_count || 0) + Number(data.real_vote_count || 0);
      
      if (totalVotes > 0) {
        setStats({
          avg: Number((totalStars / totalVotes).toFixed(1)),
          count: totalVotes
        });
      } else {
        setStats({ avg: 0, count: 0 });
      }
    } else {
      setStats({ avg: 0, count: 0 });
    }
  };

  const handleVote = async (stars: number) => {
    if (hasVoted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc('increment_real_rating', {
        page_slug: slug,
        submitted_stars: stars,
      });

      if (error) throw error;

      localStorage.setItem(`rs_voted_${slug}`, "true");
      setHasVoted(true);
      toast.success("Vielen Dank für dein Feedback!");
      fetchStats();
    } catch (error) {
      console.error('[StarRatingWidget] Error:', error);
      toast.error("Fehler beim Speichern deiner Bewertung.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hilfsfunktion zur Berechnung der Füllung pro Stern
  const getStarFill = (starIndex: number) => {
    // Wenn gehovered wird, zeigen wir volle Sterne für das Feedback-Gefühl
    if (hoveredStar !== null) {
      return hoveredStar >= starIndex ? 100 : 0;
    }
    
    // Ansonsten berechnen wir die Füllung basierend auf dem Durchschnitt
    const diff = stats.avg - (starIndex - 1);
    if (diff >= 1) return 100; // Voller Stern
    if (diff <= 0) return 0;   // Leerer Stern
    return diff * 100;         // Teilgefüllter Stern (z.B. 0.7 -> 70%)
  };

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
            onMouseEnter={() => !hasVoted && setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={isSubmitting || hasVoted}
            className="relative transition-transform hover:scale-110 focus:outline-none disabled:opacity-100"
            aria-label={`${star} Sterne vergeben`}
          >
            {/* Grauer Hintergrund-Stern */}
            <Star className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
            
            {/* Orangefarbener Vordergrund-Stern mit Teilfüllung */}
            <div 
              className="absolute top-0 left-0 overflow-hidden pointer-events-none transition-all duration-300"
              style={{ width: `${getStarFill(star)}%` }}
            >
              <Star className="w-10 h-10 fill-orange-400 text-orange-400" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm font-medium text-slate-500">
        {stats.count > 0 ? (
          <p>Durchschnitt: <span className="text-[#0A0F1C] font-bold">{stats.avg}</span> ({stats.count} Stimmen)</p>
        ) : (
          <p>Noch keine Bewertungen. Sei der Erste!</p>
        )}
      </div>

      {hasVoted && (
        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl animate-fade-in">
          <p className="text-green-800 font-medium text-lg">Vielen Dank für dein Feedback!</p>
          <p className="text-sm text-green-600 mt-1">Deine Bewertung hilft uns, die Inhalte täglich zu verbessern.</p>
        </div>
      )}
    </div>
  );
}