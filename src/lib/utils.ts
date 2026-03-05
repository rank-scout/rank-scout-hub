import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeSupabaseImage(url: string | null | undefined, width: number = 800, quality: number = 80): string {
  if (!url) return '';
  
  if (!url.includes('supabase.co') || url.includes('/storage/v1/render/image/public/')) {
    return url;
  }
  
  const optimizedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const separator = optimizedUrl.includes('?') ? '&' : '?';
  
  return `${optimizedUrl}${separator}width=${width}&quality=${quality}`;
}
