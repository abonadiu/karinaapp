import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
    allowedHosts: [".manus.computer"],
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [".manus.computer"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "circular-natal-horoscope-js": path.resolve(__dirname, "./node_modules/circular-natal-horoscope-js/dist/index.js"),
    },
  },
}));
