import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LegalFooterLink {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

export function useLegalFooterLinks(categoryId: string | null) {
  return useQuery({
    queryKey: ["legal-footer-links", categoryId],
    queryFn: async () => {
      // Build query based on whether we have a category ID
      let query = supabase
        .from("footer_links")
        .select("id, label, url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (categoryId) {
        // Get category-specific links
        query = query.eq("category_id", categoryId);
      } else {
        // Get global links (no category)
        query = query.is("category_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as LegalFooterLink[];
    },
  });
}
