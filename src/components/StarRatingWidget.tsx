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
    // Reset Zustand beim Wechsel der Seite (wichtig für SPA)
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
      // Rechnet Admin-Basis (Seed) + Echte Klicks (Real) zusammen
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
      
      fetchStats(); // Lädt die neuen, kombinierten Stats nach dem Vote
    } catch (error) {
      console.error('[StarRatingWidget] Error:', error);
      toast.error("Fehler beim Speichern deiner Bewertung.");
    } finally {
      setIsSubmitting(false);
    }
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
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={isSubmitting || hasVoted}
            className="transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
            aria-label={`${star} Sterne vergeben`}
          >
            <Star
              className={`w-10 h-10 ${
                (hoveredStar || Math.round(stats.avg)) >= star
                  ? "fill-orange-400 text-orange-400"
                  : "text-slate-200"
              }`}
            />
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