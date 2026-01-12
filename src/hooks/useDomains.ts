import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Domain = {
  id: string;
  domain: string;
  display_name: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Domain[];
    },
  });
}

export function useDefaultDomain() {
  return useQuery({
    queryKey: ["domains", "default"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .eq("is_default", true)
        .single();

      if (error) throw error;
      return data as Domain;
    },
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { domain: string; display_name: string }) => {
      const { data, error } = await supabase
        .from("domains")
        .insert({
          domain: input.domain,
          display_name: input.display_name,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("domains")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}

// Get current domain from window.location
export function getCurrentDomain(): string {
  if (typeof window === "undefined") return "dating.rank-scout.com";
  return window.location.hostname;
}
