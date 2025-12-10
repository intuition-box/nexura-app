import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import * as logger from './logger';
import { request, gql } from 'graphql-request';

// --- Load environment variables ---
{
  let loadedFrom: string | null = null;
  try {
    if (process.env.DOTENV_CONFIG_PATH) {
      dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
      loadedFrom = process.env.DOTENV_CONFIG_PATH;
    } else if (!process.env.DATABASE_URL) {
      const tryFiles = ['.env.local', '.env'];
      for (const f of tryFiles) {
        const p = fs.existsSync(f)
          ? f
          : fs.existsSync(path.resolve(process.cwd(), f))
          ? path.resolve(process.cwd(), f)
          : null;
        if (p) {
          dotenv.config({ path: p as string });
          loadedFrom = p as string;
          break;
        }
      }
    }
  } catch {}
  console.log('[env] loadedFrom=', loadedFrom, 'DATABASE_URL=', !!process.env.DATABASE_URL);
}

// --- Express app setup ---
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- CORS ---
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-wallet-address'
  );
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- Logging middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJsonResponse: any;
  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + '…';
      logger.info(logLine);
    }
  });
  next();
});

// --- Static assets ---
app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// --- API Route: fetch claims using GraphQL ---
const INTUITION_GRAPHQL = 'https://api.intuition.systems/graphql';

const LIST_TRIPLES = gql`
  query GetTriples($limit: Int, $offset: Int) {
    triples(limit: $limit, offset: $offset) {
      id
      subject {
        term
        avatarUrl
      }
      predicate {
        term
      }
      object {
        term
      }
      supportCount
      againstCount
    }
  }
`;

app.get('/api/claims', async (_req: Request, res: Response) => {
  try {
    const resp = await request(INTUITION_GRAPHQL, LIST_TRIPLES, { limit: 50, offset: 0 });

    const claims = resp.triples.map((t: any) => ({
      avatar: t.subject.avatarUrl || '',
      titleLeft: t.subject.term,
      titleMiddle: t.predicate.term,
      titleRight: t.object.term,
      support: t.supportCount ?? 0,
      against: t.againstCount ?? 0,
    }));

    res.json(claims);
  } catch (err) {
    console.error('Failed to fetch claims:', err);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// --- Error handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  logger.error('Express error handler', { err: String(err) });
  res.status(status).json({ message });
});

// --- Start server ---
export async function startServer() {
  const port = parseInt(process.env.PORT || '5051', 10);
  const host = process.env.HOST || '0.0.0.0';
  app.listen(port, host, () => {
    logger.info(`Server running at http://${host}:${port}`);
  });
}

// --- Auto start if run directly ---
if (process.argv[1]?.endsWith('index.ts') || String(process.env.START_SERVER || '').toLowerCase() === 'true') {
  startServer().catch(console.error);
}
