import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/lib/seo";

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export function useForumCategories() {
  return useQuery({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ForumCategory[];
    },
  });
}

export function useCreateForumCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const slug = generateSlug(name);
      const { data, error } = await supabase
        .from("forum_categories")
        .insert({ name, slug })
        .select()
        .single();

      if (error) throw error;
      return data as ForumCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}
