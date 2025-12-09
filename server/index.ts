// Load environment variables as early as possible.
// We prefer an explicit DOTENV_CONFIG_PATH when provided. Otherwise try a couple of
// sane fallbacks so local `.env.local` is respected when present. We avoid blindly
// overwriting existing process.env values (so real env vars remain authoritative).
import fs from 'fs';
import dotenv from 'dotenv';
{
  let loadedFrom: string | null = null;
  try {
    if (process.env.DOTENV_CONFIG_PATH) {
      dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
      loadedFrom = process.env.DOTENV_CONFIG_PATH;
    } else {
      // If DATABASE_URL already present, assume env is provided by the environment
      // (CI, hosting, etc.). Only try to load local files when DATABASE_URL is missing.
      if (!process.env.DATABASE_URL) {
        const tryFiles = ['.env.local', '.env'];
        for (const f of tryFiles) {
          const p = fs.existsSync(f) ? f : (fs.existsSync(path.resolve(process.cwd(), f)) ? path.resolve(process.cwd(), f) : null);
          if (p) {
            dotenv.config({ path: p });
            loadedFrom = p as string;
            break;
          }
        }
      }
    }
  } catch (e) {
    // ignore dotenv errors; we'll log below
  }
  try {
    console.log('[env] loadedFrom=', loadedFrom, 'DATABASE_URL=', !!process.env.DATABASE_URL);
  } catch (e) {}
}
// Quick startup trace to detect whether this module is being imported/run
if (process.env.NODE_ENV !== 'production') {
  console.log('server/index.ts loaded, process.argv[1]=', process.argv[1]);
}
import { createRequire } from 'module';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as logger from './logger'

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for bearer-token auth
app.use((req, res, next) => { 
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'); 
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-wallet-address'
  ); 
  if (req.method === 'OPTIONS') return res.status(204).end(); 
  next(); 
});


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      logger.info(logLine, { method: req.method, path, status: res.statusCode, duration })
    }
  });

  next();
});

app.use("/attached_assets", express.static(path.resolve(import.meta.dirname, "..", "attached_assets")));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

export async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('startServer: beginning');
    }
    const server = await registerRoutes(app);
    if (process.env.NODE_ENV !== 'production') {
      console.log('startServer: registerRoutes returned, server created');
    }

    // Seed tasks only when explicitly requested via SEED_ON_START.
    // For production deployments we do NOT seed by default.
    // To seed in a local/dev run set SEED_ON_START=true in your environment.
    if (String(process.env.SEED_ON_START || '').toLowerCase() === 'true') {
      try {
        const { seedTasks } = await import("./seedTasks");
        await seedTasks();
        logger.info("Tasks seeded successfully");
      } catch (error) {
        logger.error("Failed to seed tasks: " + String(error));
      }
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      logger.error('Express error handler', { err: String(err) });
    });

    // Setup vite in development
    if (app.get("env") === "development") {
      if (process.env.NODE_ENV !== 'production') {
        console.log('startServer: setting up Vite middleware (development)');
      }
      await setupVite(app, server);
      if (process.env.NODE_ENV !== 'production') {
        console.log('startServer: Vite setup complete');
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('startServer: serving static (production)');
      }
      serveStatic(app);
    }

    // Start server
    const port = parseInt(process.env.PORT || '5051', 10);
    const host = process.env.HOST || "0.0.0.0";
    // Standard TCP listen options; avoid reusePort to prevent ENOTSUP on some systems
    const listenOptions: any = { port, host };

    server.listen(listenOptions, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`Listening on ${host}:${port}`);
      logger.info(`Health check: http://${host === "0.0.0.0" ? "localhost" : host}:${port}/health`); 
    });

    // Keep reference to prevent garbage collection
    (globalThis as any).server = server;

    // Keep the event loop alive
    setInterval(() => {}, 1000);

    // Keep the promise pending to keep the process alive
    return new Promise(() => {});
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// If this module is executed directly (e.g. `tsx server/index.ts`), start the server.
// In ESM, detect direct execution in a cross-platform way by comparing the file URL path
// to the invoked script path (works on Windows and Unix). Fallback to START_SERVER env var.
(async () => {
  try {
    const urlPath = decodeURIComponent(new URL(import.meta.url).pathname || '');
    let thisPath = urlPath;
    if (process.platform === 'win32' && thisPath.startsWith('/')) thisPath = thisPath.slice(1);        
    // Normalize path separators
    thisPath = path.normalize(thisPath);

    if (process.argv[1] && path.normalize(process.argv[1]) === thisPath) {
      await startServer();
    } else if (String(process.env.START_SERVER || '').toLowerCase() === 'true') {
      await startServer();
    }
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
})();
