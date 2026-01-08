import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Redirect = {
  id: string;
  slug: string;
  target_url: string;
  click_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RedirectInput = {
  slug: string;
  target_url: string;
  is_active?: boolean;
};

export function useRedirects(includeInactive = false) {
  return useQuery({
    queryKey: ["redirects", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Redirect[];
    },
  });
}

export function useCreateRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RedirectInput) => {
      const { data, error } = await supabase
        .from("redirects")
        .insert({
          slug: input.slug,
          target_url: input.target_url,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useUpdateRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<RedirectInput> }) => {
      const { data, error } = await supabase
        .from("redirects")
        .update({
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.target_url !== undefined && { target_url: input.target_url }),
          ...(input.is_active !== undefined && { is_active: input.is_active }),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("redirects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}
