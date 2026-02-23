import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import os from "os";

const LOG_FILE = path.join(os.tmpdir(), "client-console.log");

function devLoggerPlugin() {
  return {
    name: "dev-logger",
    configureServer(server: any) {
      // Clear log file on server start
      fs.writeFileSync(LOG_FILE, `=== Vite client log started ${new Date().toISOString()} ===\n`);
      server.middlewares.use("/dev-log", (req: any, res: any) => {
        let body = "";
        req.on("data", (chunk: any) => (body += chunk));
        req.on("end", () => {
          try {
            const entry = JSON.parse(body);
            const line = `[${entry.type?.toUpperCase()}] ${entry.msg}\n`;
            fs.appendFileSync(LOG_FILE, line);
          } catch { /* ignore */ }
          res.writeHead(204);
          res.end();
        });
      });
    },
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          injectTo: "head-prepend" as const,
          children: `
(function() {
  const POST = (type, args) => {
    try {
      const msg = args.map(a => {
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch { return String(a); }
      }).join(' ');
      navigator.sendBeacon('/dev-log', JSON.stringify({ type, msg }));
    } catch {}
  };
  const _error = console.error.bind(console);
  const _warn  = console.warn.bind(console);
  const _log   = console.log.bind(console);
  console.error = (...a) => { POST('error', a); _error(...a); };
  console.warn  = (...a) => { POST('warn',  a); _warn(...a);  };
  console.log   = (...a) => { POST('log',   a); _log(...a);   };
  window.addEventListener('error', e => POST('uncaught', [e.message, e.filename + ':' + e.lineno]));
  window.addEventListener('unhandledrejection', e => POST('promise', [String(e.reason)]));
})();
`,
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), devLoggerPlugin()],
  resolve: {
    alias: {
      "@/": path.resolve(import.meta.dirname, "src"),
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
