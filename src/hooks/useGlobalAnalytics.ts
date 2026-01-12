import { useSetting } from "@/hooks/useSettings";

export function useGlobalAnalyticsCode(): string {
  return useSetting<string>("global_analytics_code", "");
}
