import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildAbsoluteSiteUrl } from "@/lib/routes";

export type SeoRedirect = Database["public"]["Tables"]["seo_redirects"]["Row"];
export type SeoRedirectEntityTable = SeoRedirect["entity_table"];
export type SeoRedirectFilters = {
  includeInactive?: boolean;
  entityTable?: SeoRedirectEntityTable | "all";
  search?: string;
};

function escapeIlikeTerm(value: string) {
  return value.replace(/[%_,]/g, " ").trim();
}

export function useSeoRedirects(filters: SeoRedirectFilters = {}) {
  const {
    includeInactive = true,
    entityTable = "all",
    search = "",
  } = filters;

  return useQuery({
    queryKey: ["seo-redirects", includeInactive, entityTable, search],
    queryFn: async () => {
      let query = supabase
        .from("seo_redirects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      if (entityTable !== "all") {
        query = query.eq("entity_table", entityTable);
      }

      const safeSearch = escapeIlikeTerm(search);

      if (safeSearch.length > 0) {
        const pattern = `%${safeSearch}%`;
        query = query.or(`source_path.ilike.${pattern},target_path.ilike.${pattern}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []) as SeoRedirect[];
    },
  });
}

export function useUpdateSeoRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Pick<SeoRedirect, "is_locked" | "is_active" | "target_path" | "redirect_code">>;
    }) => {
      const { data, error } = await supabase
        .from("seo_redirects")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data as SeoRedirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-redirects"] });
    },
  });
}

export function buildSeoRedirectCloudflareCsv(
  redirects: SeoRedirect[],
  siteUrl = "https://rank-scout.com",
) {
  const rows = ["SOURCE_URL,TARGET_URL,STATUS_CODE"];

  redirects
    .filter((redirect) => redirect.is_active)
    .forEach((redirect) => {
      rows.push(
        [
          buildAbsoluteSiteUrl(redirect.source_path, siteUrl),
          buildAbsoluteSiteUrl(redirect.target_path, siteUrl),
          String(redirect.redirect_code ?? 301),
        ].join(","),
      );
    });

  return rows.join("\n");
}

export function downloadSeoRedirectCloudflareCsv(
  redirects: SeoRedirect[],
  fileName = "cloudflare-bulk-redirects.csv",
  siteUrl = "https://rank-scout.com",
) {
  const csv = buildSeoRedirectCloudflareCsv(redirects, siteUrl);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
}
