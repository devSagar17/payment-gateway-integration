import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    minify: "esbuild", // Use esbuild for faster minification
    sourcemap: false, // Disable sourcemaps for production
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve("./client"),
      "@shared": path.resolve("./shared"),
    },
  },
}));