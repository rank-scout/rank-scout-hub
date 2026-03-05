import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. Strikter React-Core (Verhindert den createContext-Bug)
            if (
              id.includes("/node_modules/react/") ||
              id.includes("/node_modules/react-dom/") ||
              id.includes("/node_modules/react-router-dom/") ||
              id.includes("/node_modules/react-router/")
            ) {
              return "react-core";
            }
            
            // 2. Datenbank & Auth Backend
            if (id.includes("@supabase")) {
              return "supabase-client";
            }

            // 3. Schwere UI-Elemente, Icons & Animationen auslagern
            if (
              id.includes("@radix-ui") ||
              id.includes("lucide-react") ||
              id.includes("framer-motion") ||
              id.includes("recharts") ||
              id.includes("tailwind") ||
              id.includes("canvas-confetti")
            ) {
              return "ui-components";
            }

            // 4. Den Tiptap-Editor (Magazin) isolieren
            if (id.includes("@tiptap") || id.includes("dompurify")) {
              return "tiptap-editor";
            }

            // 5. Alles andere landet sauber im Vendor-Chunk
            return "vendor";
          }
        },
      },
    },
  },
}));