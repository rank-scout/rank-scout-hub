import { CityLandingFooter } from "@/components/templates/CityLandingFooter";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

export function Footer({ category }: { category?: Category | null }) {
  return <CityLandingFooter category={category} />;
}

