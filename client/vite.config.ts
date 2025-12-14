import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          query: ['@tanstack/react-query'],
          wallet: ['@reown/appkit', '@reown/appkit-adapter-wagmi', '@wagmi/core'],
          charts: ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to reduce warnings
  },
  appType: "spa",
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Disable Vite's HMR overlay so runtime errors appear in the browser console
    // instead of as a blocking overlay. This helps capture the full stack trace.
    hmr: {
      overlay: false,
    },
  },
});
