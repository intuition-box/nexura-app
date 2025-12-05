import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReferralEventSchema, insertReferralClaimSchema } from "@shared/schema";
import crypto from "crypto";
import { verifyMessage } from "ethers";
import fs from "fs";
import path from "path";
import campaignsRouter from "../api/campaigns";
import questsRouter from "../api/quests";

// Optional S3-compatible upload support for production (recommended for serverless)
let s3Client: any = null;
let S3_BUCKET: string | undefined = undefined;
let S3_REGION: string | undefined = undefined;
try {
  // Lazy require so local dev without AWS SDK doesn't crash
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
  S3_BUCKET = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || undefined;
  S3_REGION = process.env.S3_REGION || process.env.AWS_REGION || undefined;
  if (S3_BUCKET) {
    s3Client = new S3Client({ region: S3_REGION });
    // keep PutObjectCommand available via s3Client.__PutObjectCommand for later use
    (s3Client as any).__PutObjectCommand = PutObjectCommand;
  }
} catch (e) {
  // AWS SDK not installed or not configured; we'll fallback to local filesystem in dev
}

// In-memory stores for challenges and legacy bearer sessions.
const challenges = new Map<string, { message: string; expiresAt: number; used?: boolean }>();
const sessions = new Map<string, { address: string; createdAt: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for monitoring and load balancers
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Debug endpoint to inspect incoming headers and session-like info.
  app.get('/api/debug-session', (req, res) => {
    const secret = process.env.DEBUG_SESSION_SECRET || null;
    if (!secret) return res.status(404).json({ error: 'not available' });
    const provided = String(req.get('x-debug-secret') || '');
    if (provided !== secret) return res.status(403).json({ error: 'forbidden' });

    try {
      const info = { headers: req.headers, cookieHeader: req.headers.cookie || null };
      return res.json(info);
    } catch (e) {
      return res.status(500).json({ error: 'failed', details: String(e) });
    }
  });

  // campaign
  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/quests", questsRouter)
  // Referral system routes
  app.get("/api/referrals/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getReferralStats(userId);
      // Ensure referralLink is an absolute URL. Storage implementations may return
      // a path-only link or a hardcoded domain; prefer APP_URL if configured,
      // otherwise derive from the incoming request's host.
      try {
        const link = String((stats && stats.referralLink) || '').trim();
        if (link && !/^https?:\/\//i.test(link)) {
          const appUrl = (process.env.APP_URL || process.env.VITE_BACKEND_URL || '').replace(/\/+$/g, '');
          const prefix = appUrl || `${req.protocol}://${String(req.get('host') || '')}`;
          stats.referralLink = `${prefix.replace(/\/+$/g, '')}/${link.replace(/^\/+/, '')}`;
        }
      } catch (e) {
        // ignore and return stats as-is
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ error: "Failed to fetch referral stats" });
    }
  });

  app.post("/api/referrals/event", async (req, res) => {
    try {
      const validatedData = insertReferralEventSchema.parse(req.body);
      const event = await storage.createReferralEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating referral event:", error);
      res.status(400).json({ error: "Invalid referral event data" });
    }
  });

  // List referral events (with optional referred-user enrichment)
  app.get('/api/referrals/list/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const events = await storage.getReferralEventsByReferrer(userId);
      // Enrich events with referenced user profile if possible
      const out: any[] = [];
      for (const ev of events) {
        const referredId = (ev as any).referredUserId || (ev as any).referred_user_id || null;
        let referredUser = null;
        if (referredId) {
          try {
            const u = await storage.getUser(referredId);
            const p = await storage.getUserProfile(referredId);
            if (u || p) {
              referredUser = {
                id: u?.id || referredId,
                username: u?.username || null,
                displayName: (p as any)?.displayName || (u as any)?.displayName || u?.username || null,
                avatar: (p as any)?.avatar || (u as any)?.avatar || null,
                xp: (p as any)?.xp || 0,
                level: (p as any)?.level || 1,
              };
            }
          } catch (e) {
            // ignore enrichment errors
            referredUser = null;
          }
        }
        out.push({
          id: ev.id,
          referrerUserId: ev.referrerUserId || (ev as any).referrer_user_id,
          referredUserId: referredId,
          createdAt: ev.createdAt || (ev as any).created_at || null,
          referredUser,
        });
      }
      return res.json({ events: out });
    } catch (e) {
      console.error('[GET /api/referrals/list/:userId] error', e);
      return res.status(500).json({ error: 'failed to fetch referral list' });
    }
  });

  // Claim referral rewards (disabled - to be implemented later)
  app.post("/api/referrals/claim/:userId", async (req, res) => {
    try {
      return res.status(503).json({ error: "Reward claiming not yet available" });
    } catch (error) {
      console.error("Error claiming referral rewards:", error);
      res.status(500).json({ error: "Failed to claim rewards" });
    }
  });

  // Dev-only helper: inspect persisted user profiles file. Disabled in production.
  app.get('/__dev/user_profiles', async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'not available' });
      const pn = require('path').resolve(process.cwd(), 'server', 'data', 'user_profiles.json');
      const fs = require('fs');
      if (!fs.existsSync(pn)) return res.json({});
      const raw = fs.readFileSync(pn, 'utf8');
      const parsed = JSON.parse(raw || '{}');
      return res.json(parsed);
    } catch (e) {
      console.error('__dev/user_profiles error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Dev/Admin: export current in-memory legacy sessions (for migration)
  app.get('/__admin/export-sessions', async (req, res) => {
    try {
      const secret = process.env.DEBUG_SESSION_SECRET || null;
      const provided = String(req.get('x-debug-secret') || '');
      if (!secret) return res.status(404).json({ error: 'not available' });
      if (provided !== secret) return res.status(403).json({ error: 'forbidden' });
      const arr: any[] = [];
      sessions.forEach((obj, token) => {
        arr.push({ token, address: obj.address || null, createdAt: obj.createdAt || null });
      });
      return res.json({ sessions: arr });
    } catch (e) {
      console.error('/__admin/export-sessions error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Dev/Admin: migrate in-memory legacy sessions into DB-backed user_session_tokens
  app.post('/__admin/migrate-sessions', async (req, res) => {
    try {
      const secret = process.env.DEBUG_SESSION_SECRET || null;
      const provided = String(req.get('x-debug-secret') || '');
      if (!secret) return res.status(404).json({ error: 'not available' });
      if (provided !== secret) return res.status(403).json({ error: 'forbidden' });

      const migrated: string[] = [];
      const skipped: string[] = [];

      const poolish = (storage as any).query ? (storage as any) : null;

      const entries = Array.from(sessions.entries());
      for (const [token, obj] of entries) {
        const address = obj.address ? String(obj.address).toLowerCase() : null;
        const createdAt = obj.createdAt ? new Date(obj.createdAt) : new Date();

        // try to resolve userId by address
        let userId: string | null = null;
        try {
          const user = address ? await storage.getUserByAddress(address) : null;
          if (user) userId = user.id || null;
        } catch (e) {
          // ignore
        }

        try {
          if (poolish && typeof poolish.query === 'function') {
            await poolish.query(`INSERT INTO user_session_tokens (token, user_id, address, created_at) VALUES ($1,$2,$3,$4) ON CONFLICT (token) DO NOTHING`, [token, userId, address, createdAt]);
          } else {
            const mem = storage as any;
            if (mem && mem.sessionTokens && typeof mem.sessionTokens.set === 'function') {
              mem.sessionTokens.set(token, { userId: userId || '', address: address || '', createdAt: createdAt.toISOString() });
            } else if (mem && typeof mem.createSessionToken === 'function') {
              await mem.createSessionToken(userId || '', address || null);
            }
          }
          migrated.push(token);
        } catch (e) {
          console.warn('failed to migrate token', token, String(e));
          skipped.push(token);
        }
      }

      return res.json({ migratedCount: migrated.length, migrated, skippedCount: skipped.length, skipped });
    } catch (e) {
      console.error('/__admin/migrate-sessions error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Wallet auth: issue a challenge message for an address
  app.get("/challenge", async (req, res) => {
    try {
      const address = String(req.query.address || "").trim();
      if (!address) return res.status(400).json({ error: "address required" });
      const nonce = crypto.randomBytes(12).toString("hex");
      const message = `Nexura Wallet Login\nAddress: ${address}\nNonce: ${nonce}`;
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      challenges.set(address.toLowerCase(), { message, expiresAt });
      return res.json({ message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed to create challenge" });
    }
  });

  app.post("/challenge", async (req, res) => {
    try {
      const { address } = req.body || {};
      if (!address) return res.status(400).json({ error: "address required" });
      const addr = String(address).trim().toLowerCase();
      const nonce = crypto.randomBytes(12).toString("hex");
      const message = `Nexura Wallet Login\nAddress: ${addr}\nNonce: ${nonce}`;
      const expiresAt = Date.now() + 5 * 60 * 1000;
      challenges.set(addr, { message, expiresAt });
      return res.json({ message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed to create challenge" });
    }
  });

  // Backwards-compatible simple auth endpoint used by some frontends
  // This mirrors the /auth/wallet behavior so older clients that call
  // /auth/simple will receive the same accessToken response.
  app.post("/auth/simple", async (req, res) => {
    try {
      const { address, signature, message } = req.body || {};
      if (!address || !signature || !message) return res.status(400).json({ error: "address, signature and message required" });
      const stored = challenges.get(String(address).toLowerCase());
      if (stored) {
        if (stored.used) return res.status(400).json({ error: "challenge already used" });
        if (stored.expiresAt < Date.now()) return res.status(400).json({ error: "challenge expired" });
        if (stored.message !== message) return res.status(400).json({ error: "message mismatch" });
      }
      const recovered = verifyMessage(String(message), String(signature));
      if (recovered.toLowerCase() !== String(address).toLowerCase()) {
        return res.status(401).json({ error: "signature verification failed" });
      }
      if (stored) stored.used = true;

      let token: string;
      try {
        if (storage && typeof (storage as any).createSessionToken === 'function') {
          let userIdForToken: string | null = null;
          try {
            const maybeUser = await storage.getUserByAddress(String(address).toLowerCase());
            if (maybeUser && (maybeUser as any).id) userIdForToken = (maybeUser as any).id;
          } catch (err) { /* ignore */ }
          token = await (storage as any).createSessionToken(userIdForToken || '', String(address).toLowerCase());
        } else {
          token = crypto.randomBytes(32).toString("hex");
          sessions.set(token, { address: String(address).toLowerCase(), createdAt: Date.now() });
        }
      } catch (e) {
        console.warn('failed to persist session token to storage, falling back to in-memory token', String(e));
        token = crypto.randomBytes(32).toString("hex");
        sessions.set(token, { address: String(address).toLowerCase(), createdAt: Date.now() });
      }

      try {
        const addrLower = String(address).toLowerCase();
        let user = await storage.getUserByAddress(addrLower);
        if (!user) {
          const randPwd = crypto.randomBytes(12).toString("hex");
          user = await storage.createUser({ username: addrLower, password: randPwd, address: addrLower } as any);
        }
      } catch (e) {
        console.warn("failed to ensure user record for address", e);
      }

      return res.json({ accessToken: token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "verification failed" });
    }
  });

  // Verify signature and create a simple session token (returned to client)
  app.post("/auth/wallet", async (req, res) => {
    try {
      const { address, signature, message } = req.body || {};
      if (!address || !signature || !message) return res.status(400).json({ error: "address, signature and message required" });
      const stored = challenges.get(String(address).toLowerCase());
      // Allow either stored challenge or provided message (but prefer stored)
      if (stored) {
        if (stored.used) return res.status(400).json({ error: "challenge already used" });
        if (stored.expiresAt < Date.now()) return res.status(400).json({ error: "challenge expired" });
        if (stored.message !== message) return res.status(400).json({ error: "message mismatch" });
      }

      const recovered = verifyMessage(String(message), String(signature));
      if (recovered.toLowerCase() !== String(address).toLowerCase()) {
        return res.status(401).json({ error: "signature verification failed" });
      }

      // mark challenge used
      if (stored) stored.used = true;

      // Create a bearer token and persist it (prefer DB via storage.createSessionToken)
      let token: string;
      try {
        if (storage && typeof (storage as any).createSessionToken === 'function') {
          // Try to resolve user id by address
          let userIdForToken: string | null = null;
          try {
            const maybeUser = await storage.getUserByAddress(String(address).toLowerCase());
            if (maybeUser && (maybeUser as any).id) userIdForToken = (maybeUser as any).id;
          } catch (err) { /* ignore */ }
          token = await (storage as any).createSessionToken(userIdForToken || '', String(address).toLowerCase());
        } else {
          token = crypto.randomBytes(32).toString("hex");
          sessions.set(token, { address: String(address).toLowerCase(), createdAt: Date.now() });
        }
      } catch (e) {
        console.warn('failed to persist session token to storage, falling back to in-memory token', String(e));
        token = crypto.randomBytes(32).toString("hex");
        sessions.set(token, { address: String(address).toLowerCase(), createdAt: Date.now() });
      }

      // Ensure a user record exists for this address so /profile can return user data.
      try {
        const addrLower = String(address).toLowerCase();
        let user = await storage.getUserByAddress(addrLower);
        if (!user) {
          // create a lightweight user record keyed by address
          const randPwd = crypto.randomBytes(12).toString("hex");
          // We include an `address` field so MemStorage and other storage impls can look it up
          user = await storage.createUser({ username: addrLower, password: randPwd, address: addrLower } as any);
        }

        // Nothing to persist to cookies; clients should store bearer token.
      } catch (e) {
        console.warn("failed to ensure user record for address", e);
      }

      return res.json({ accessToken: token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "verification failed" });
    }
  });

  // Dev-only login helper removed for production readiness. If you need a
  // developer-only shortcut, create it locally but do NOT deploy it to
  // production. This endpoint was intentionally removed.

  // Removed permissive /auth/open endpoint for production. Use the wallet
  // signature flow (/challenge + /auth/wallet) for secure logins.

  // --- Twitter (X) OAuth1.0a integration (request token -> authorize -> access token)
  const requestTokenSecrets = new Map<string, { secret: string; sessionToken?: string }>();

  // parseCookies removed: authentication uses Authorization: Bearer <token> only

  // Require an Authorization: Bearer <token> header and resolve session from storage
  async function getSessionFromReq(req: any) {
    try {
      const auth = String(req.headers.authorization || "").trim();
      // DEBUG: log presence of Authorization header if DEBUG_SESSION_SECRET is set
      try {
        const debugSecret = process.env.DEBUG_SESSION_SECRET;
        if (debugSecret) {
          const hasAuth = !!auth;
          const redacted = auth && auth.split(/\s+/)[1] ? ((auth.split(/\s+/)[1] as string).slice(0,4) + '...' + (auth.split(/\s+/)[1] as string).slice(-4)) : null;
          console.log('getSessionFromReq debug:', { hasAuth, redacted });
        }
      } catch (logErr) {
        // ignore logging errors
      }
      if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null;
      const token = auth.split(/\s+/)[1];
      if (!token) return null;

      if (storage && typeof (storage as any).getSessionByToken === 'function') {
        try {
          const dbSess = await (storage as any).getSessionByToken(token);
          // DEBUG: log if DB session found
          try {
            const debugSecret = process.env.DEBUG_SESSION_SECRET;
            if (debugSecret) {
              console.log('getSessionFromReq debug: dbSess found?', !!dbSess);
            }
          } catch (e) {}
          if (dbSess) {
            const sessionObj: any = { createdAt: dbSess.createdAt || Date.now() };
            if (dbSess.userId) sessionObj.userId = dbSess.userId;
            if (dbSess.address) sessionObj.address = String(dbSess.address).toLowerCase();
            return { token, session: sessionObj };
          }
        } catch (e) {
          console.warn('error checking DB session token', String(e));
        }
      }

      // Dev fallback: in-memory sessions map
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        const s = sessions.get(token);
        if (s) return { token, session: s };
      }
      return null;
    } catch (e) {
      console.warn('getSessionFromReq failed', String(e));
      return null;
    }
  }

  // Step 1: obtain request token and redirect user to X authorize
  app.get('/auth/x/login', async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess || !sess.session) return res.status(401).send('sign in required');

      const TWITTER_KEY = process.env.TWITTER_API_KEY;
      const TWITTER_SECRET = process.env.TWITTER_API_SECRET;
      const CALLBACK = process.env.TWITTER_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/x/callback`;
      if (!TWITTER_KEY || !TWITTER_SECRET) return res.status(500).json({ error: 'twitter keys not configured' });

      // build OAuth1 header for request_token
      const oauth = require('crypto');
      // We'll use a minimal OAuth1 signature via oauth-1.0a style headers using simple library if available
      const oauth1 = require('oauth-1.0a');
      const client = oauth1({ consumer: { key: TWITTER_KEY, secret: TWITTER_SECRET }, signature_method: 'HMAC-SHA1', hash_function(base_string: string, key: string) { return require('crypto').createHmac('sha1', key).update(base_string).digest('base64'); } });
      const request_data = { url: 'https://api.twitter.com/oauth/request_token', method: 'POST', data: { oauth_callback: CALLBACK } };
      const headers = client.toHeader(client.authorize(request_data));

      const r = await fetch(request_data.url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' } });
      const txt = await r.text();
      if (!r.ok) {
        console.error('request_token failed', txt);
        return res.status(500).json({ error: 'request_token_failed', details: txt });
      }
      const params = new URLSearchParams(txt);
      const oauth_token = params.get('oauth_token');
      const oauth_token_secret = params.get('oauth_token_secret');
      if (!oauth_token || !oauth_token_secret) return res.status(500).json({ error: 'invalid_request_token' });

      requestTokenSecrets.set(oauth_token, { secret: oauth_token_secret, sessionToken: sess.token });

      // redirect to authorize URL
      return res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`);
    } catch (e) {
      console.error('auth/x/login error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Step 2: callback from Twitter
  app.get('/auth/x/callback', async (req, res) => {
    try {
      const { oauth_token, oauth_verifier } = req.query as any;
      if (!oauth_token || !oauth_verifier) return res.status(400).send('missing');
      const stored = requestTokenSecrets.get(String(oauth_token));
      if (!stored) return res.status(400).send('unknown request token');

      const TWITTER_KEY = process.env.TWITTER_API_KEY;
      const TWITTER_SECRET = process.env.TWITTER_API_SECRET;
      if (!TWITTER_KEY || !TWITTER_SECRET) return res.status(500).json({ error: 'twitter keys not configured' });

      const oauth1 = require('oauth-1.0a');
      const client = oauth1({ consumer: { key: TWITTER_KEY, secret: TWITTER_SECRET }, signature_method: 'HMAC-SHA1', hash_function(base_string: string, key: string) { return require('crypto').createHmac('sha1', key).update(base_string).digest('base64'); } });

      const request_data = { url: 'https://api.twitter.com/oauth/access_token', method: 'POST', data: { oauth_verifier } };
      const token = { key: oauth_token as string, secret: stored.secret };
      const headers = client.toHeader(client.authorize(request_data, token));
      const r = await fetch(request_data.url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ oauth_verifier }) });
      const txt = await r.text();
      if (!r.ok) {
        console.error('access_token failed', txt);
        return res.status(500).json({ error: 'access_token_failed', details: txt });
      }
      const params = new URLSearchParams(txt);
      const access_token = params.get('oauth_token');
      const access_token_secret = params.get('oauth_token_secret');
      const user_id = params.get('user_id');
      const screen_name = params.get('screen_name');
      if (!access_token || !access_token_secret) return res.status(500).json({ error: 'invalid_access_token' });

      // find session token and associated app user
      const sessionToken = stored.sessionToken;
      const s = sessions.get(sessionToken || '');
      if (!s) {
        // no session: still store tokens under the address as a fallback
        const addr = (s && (s as any).address) || null;
        if (!addr) {
          // cannot associate - return to quests with notice
          return res.redirect('/quests');
        }
      }

      // look up user by address
      let user = null;
      let userId = null;
      if ((s as any).session?.userId) {
        user = await storage.getUser((s as any).session.userId);
        userId = user ? user.id : null;
      } else {
        user = await storage.getUserByAddress((s as any).address);
        userId = user ? user.id : null;
      }
      if (!userId) {
        // create a lightweight user for this address if needed
        // attempt to create or skip
      }

      if (userId) {
        await storage.upsertUserOAuth(userId, 'twitter', { oauth_token: access_token, oauth_token_secret: access_token_secret, user_id, screen_name });
      }

      // cleanup request token secret
      requestTokenSecrets.delete(String(oauth_token));

      // redirect the user back to the app quests page
      return res.redirect('/quests');
    } catch (e) {
      console.error('auth/x/callback error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Verification endpoints for quests (follow/like/retweet)
  app.post('/quests/verify/follow', async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess || !sess.session) return res.status(401).json({ error: 'not authenticated' });
      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) return res.status(400).json({ error: 'no user' });
      const token = await storage.getOAuthToken(user.id, 'twitter');
      if (!token) return res.status(403).json({ error: 'no-twitter-token' });

      const target = String((req.body && req.body.target) || req.query.target || '');
      if (!target) return res.status(400).json({ error: 'target required' });

      // call friendships/show (v1.1) to check relationship
      const TWITTER_KEY = process.env.TWITTER_API_KEY;
      const TWITTER_SECRET = process.env.TWITTER_API_SECRET;
      const oauth1 = require('oauth-1.0a');
      const client = oauth1({ consumer: { key: TWITTER_KEY, secret: TWITTER_SECRET }, signature_method: 'HMAC-SHA1', hash_function(base_string: string, key: string) { return require('crypto').createHmac('sha1', key).update(base_string).digest('base64'); } });
      const userToken = { key: token.access_token || token.oauth_token, secret: token.refresh_token || token.oauth_token_secret || token.access_token_secret };
      const url = `https://api.twitter.com/1.1/friendships/show.json?source_screen_name=${encodeURIComponent(token.screen_name || '')}&target_screen_name=${encodeURIComponent(target)}`;
      const request_data = { url, method: 'GET' };
      const headers = client.toHeader(client.authorize(request_data, userToken));
      const r = await fetch(url, { method: 'GET', headers: { ...headers, Accept: 'application/json' } });
      const j = await r.json().catch(() => null);
      if (!r.ok) return res.status(500).json({ error: 'api_failed', details: j });
      const follows = j && j.relationship && j.relationship.source && j.relationship.source.following;
      if (follows) {
        return res.json({ ok: true });
      }
      return res.json({ ok: false });
    } catch (e) {
      console.error('/quests/verify/follow error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Stub endpoints for like and retweet verification (can be expanded)
  app.post('/quests/verify/like', async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess || !sess.session) return res.status(401).json({ error: 'not authenticated' });
      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) return res.status(400).json({ error: 'no user' });
      const token = await storage.getOAuthToken(user.id, 'twitter');
      if (!token) return res.status(403).json({ error: 'no-twitter-token' });

      const tweetId = String((req.body && req.body.tweetId) || req.query.tweetId || '');
      if (!tweetId) return res.status(400).json({ error: 'tweetId required' });

      const TWITTER_KEY = process.env.TWITTER_API_KEY;
      const TWITTER_SECRET = process.env.TWITTER_API_SECRET;
      const oauth1 = require('oauth-1.0a');
      const client = oauth1({ consumer: { key: TWITTER_KEY, secret: TWITTER_SECRET }, signature_method: 'HMAC-SHA1', hash_function(base_string: string, key: string) { return require('crypto').createHmac('sha1', key).update(base_string).digest('base64'); } });
      const userToken = { key: token.access_token || token.oauth_token, secret: token.refresh_token || token.oauth_token_secret || token.access_token_secret };
      const url = `https://api.twitter.com/1.1/statuses/show.json?id=${encodeURIComponent(tweetId)}&include_my_retweet=false`;
      const request_data = { url, method: 'GET' };
      const headers = client.toHeader(client.authorize(request_data, userToken));
      const r = await fetch(url, { method: 'GET', headers: { ...headers, Accept: 'application/json' } });
      const j = await r.json().catch(() => null);
      if (!r.ok) return res.status(500).json({ error: 'api_failed', details: j });
      const favorited = !!j && !!j.favorited;
      return res.json({ ok: !!favorited });
    } catch (e) {
      console.error('/quests/verify/like error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  app.post('/quests/verify/retweet', async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess || !sess.session) return res.status(401).json({ error: 'not authenticated' });
      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) return res.status(400).json({ error: 'no user' });
      const token = await storage.getOAuthToken(user.id, 'twitter');
      if (!token) return res.status(403).json({ error: 'no-twitter-token' });

      const tweetId = String((req.body && req.body.tweetId) || req.query.tweetId || '');
      if (!tweetId) return res.status(400).json({ error: 'tweetId required' });

      const TWITTER_KEY = process.env.TWITTER_API_KEY;
      const TWITTER_SECRET = process.env.TWITTER_API_SECRET;
      const oauth1 = require('oauth-1.0a');
      const client = oauth1({ consumer: { key: TWITTER_KEY, secret: TWITTER_SECRET }, signature_method: 'HMAC-SHA1', hash_function(base_string: string, key: string) { return require('crypto').createHmac('sha1', key).update(base_string).digest('base64'); } });
      const userToken = { key: token.access_token || token.oauth_token, secret: token.refresh_token || token.oauth_token_secret || token.access_token_secret };
      // statuses/show returns `retweeted` boolean for the authenticating user
      const url = `https://api.twitter.com/1.1/statuses/show.json?id=${encodeURIComponent(tweetId)}&include_my_retweet=true`;
      const request_data = { url, method: 'GET' };
      const headers = client.toHeader(client.authorize(request_data, userToken));
      const r = await fetch(url, { method: 'GET', headers: { ...headers, Accept: 'application/json' } });
      const j = await r.json().catch(() => null);
      if (!r.ok) return res.status(500).json({ error: 'api_failed', details: j });
      const retweeted = !!j && !!j.retweeted;
      return res.json({ ok: !!retweeted });
    } catch (e) {
      console.error('/quests/verify/retweet error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Levels minting endpoint: mint NFTs for milestone levels (server-side wallet required)
  app.post('/api/levels/mint', async (req, res) => {
    try {
      const { level } = req.body || {};
      if (!level || typeof Number(level) !== 'number') return res.status(400).json({ error: 'level required' });
      const lvl = Number(level);
      if (lvl <= 0 || lvl > 100 || lvl % 5 !== 0) return res.status(400).json({ error: 'level must be a multiple of 5 between 5 and 100' });

      const sess = await getSessionFromReq(req);
      if (!sess || !sess.session) return res.status(401).json({ error: 'not authenticated' });

      // Determine recipient address: prefer session.address then storage lookup
      let recipientAddr: string | null = null;
      try {
        if (sess.session.address) recipientAddr = String(sess.session.address).toLowerCase();
        else if (sess.session.userId) {
          const u = await storage.getUser(sess.session.userId as string);
          if (u && (u as any).address) recipientAddr = String((u as any).address).toLowerCase();
        }
      } catch (e) {
        // ignore
      }

      if (!recipientAddr) return res.status(400).json({ error: 'no recipient wallet address available for this user' });

      // Build token URI (simple hosted metadata path on APP_URL)
      const appUrl = (process.env.APP_URL || '').replace(/\/+$/g, '') || `${req.protocol}://${String(req.get('host') || '')}`;
      const tokenUri = `${appUrl}/levels/metadata/level-${lvl}.json`;

      // Check server wallet configuration
      const CONTRACT = process.env.LEVEL_BADGE_ADDRESS || process.env.LEVEL_CONTRACT_ADDRESS || null;
      const RPC = process.env.LEVEL_RPC_URL || process.env.INTUITION_TESTNET_RPC || null;
      const PK = process.env.LEVEL_SERVER_PRIVATE_KEY || process.env.SERVER_PRIVATE_KEY || null;

      // If config missing, queue the job to disk (simple queue) and return queued response
      if (!CONTRACT || !RPC || !PK) {
        // Simple on-disk job queue
        try {
          const jobsPath = path.resolve(process.cwd(), 'server', 'data', 'mint_jobs.json');
          let jobs: any[] = [];
          if (fs.existsSync(jobsPath)) {
            try { jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8') || '[]'); } catch(e) { jobs = []; }
          }
          const job = { id: crypto.randomBytes(8).toString('hex'), userId: sess.session.userId || null, recipient: recipientAddr, level: lvl, tokenUri, createdAt: new Date().toISOString(), status: 'queued' };
          jobs.push(job);
          fs.mkdirSync(path.dirname(jobsPath), { recursive: true });
          fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2), 'utf8');
          return res.json({ queued: true, job });
        } catch (e) {
          console.warn('failed to enqueue mint job', e);
          return res.status(500).json({ error: 'failed to queue mint job' });
        }
      }

      // Attempt to mint immediately using ethers
      try {
        // lazy require to avoid adding dependency at top-level
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ethers = require('ethers');
        const provider = new ethers.providers.JsonRpcProvider(RPC);
        const wallet = new ethers.Wallet(PK, provider);

        // Try to load ABI from local artifact (nexura-backend-main smart-contract artifacts)
        let abi = null;
        try {
          const artifactPath = path.resolve(process.cwd(), '..', 'nexura-backend-main', 'smart-contract', 'artifacts', 'contracts', 'LevelBadge.sol', 'LevelBadge.json');
          if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            abi = artifact.abi;
          }
        } catch (e) {
          // ignore
        }
        if (!abi) {
          // minimal ABI for mintTo(address,string)
          abi = [{ "inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"uri","type":"string"}],"name":"mintTo","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function" }];
        }

        const contract = new ethers.Contract(CONTRACT, abi, wallet);
        const tx = await contract.mintTo(recipientAddr, tokenUri, { gasLimit: 800000 });
        const receipt = await tx.wait();
        // Optionally persist a record of the mint
        try {
          const jobsPath = path.resolve(process.cwd(), 'server', 'data', 'mint_jobs.json');
          let jobs: any[] = [];
          if (fs.existsSync(jobsPath)) { try { jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8') || '[]'); } catch(e) { jobs = []; } }
          const job = { id: crypto.randomBytes(8).toString('hex'), userId: sess.session.userId || null, recipient: recipientAddr, level: lvl, tokenUri, createdAt: new Date().toISOString(), status: 'minted', txHash: tx.hash, receipt };
          jobs.push(job);
          fs.mkdirSync(path.dirname(jobsPath), { recursive: true });
          fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2), 'utf8');
        } catch (e) {
          console.warn('failed to persist mint job', e);
        }

        return res.json({ ok: true, txHash: tx.hash, receipt });
      } catch (e) {
        console.error('levels mint error', e);
        return res.status(500).json({ error: 'mint failed', details: String(e) });
      }
    } catch (e) {
      console.error('/api/levels/mint error', e);
      return res.status(500).json({ error: 'failed' });
    }
  });

  // Logout: remove bearer token (DB or in-memory). Clients should remove local token.
  app.post("/auth/logout", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      // Remove bearer token: delete from DB if supported, otherwise clear in-memory
      try {
        if (sess && sess.token) {
          if (storage && typeof (storage as any).deleteSessionToken === 'function') {
            try { await (storage as any).deleteSessionToken(sess.token); } catch (e) { console.warn('deleteSessionToken failed', String(e)); }
          }
          if (sessions.has(sess.token)) sessions.delete(sess.token);
        }
      } catch (e) {
        console.warn('logout cleanup failed', String(e));
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("logout failed", err);
      return res.status(500).json({ error: "logout failed" });
    }
  });

  // Return profile for authenticated session (bearer-based)
  app.get("/profile", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess) return res.status(401).json({ error: "not authenticated" });

      // Try to fetch user from DB using userId stored on session when available,
      // falling back to address lookup for backward compatibility.
      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) {
        // Authenticated but no user record yet; return empty object so client
        // can render defaults client-side.
        return res.json({ user: null, hasProfile: false });
      }

      // Get profile data
      const profile = await storage.getUserProfile(user.id);

      // Remove password field before sending
      const { password, ...safeUser } = user as any;
      
      return res.json({
        user: {
          ...safeUser,
          displayName: profile?.displayName || (user as any).displayName || user.username,
          level: profile?.level || 1,
          xp: profile?.xp || 0,
        },
        hasProfile: !!profile,
        profile: profile || null
      });
    } catch (err) {
      console.error("profile error", err);
      return res.status(500).json({ error: "failed to fetch profile" });
    }
  });

  // Return combined user + profile info for the authenticated session
  app.get("/api/me", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess) return res.status(401).json({ error: "not authenticated" });

      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) return res.json({ user: null, hasProfile: false, hasProject: false });
      const profile = await storage.getUserProfile(user.id);

      // check for projects owned by this wallet address or by user id
      let projects = [] as any[];
      try {
        const all = await storage.listProjects();
        const lower = String(sess.session.address).toLowerCase();
        projects = all.filter((p: any) => {
          const ownerAddr = (p.ownerAddress || p.owner_address || "").toString().toLowerCase();
          const ownerUserId = p.ownerUserId || p.owner_user_id || p.ownerUserId || null;
          return (ownerAddr && ownerAddr === lower) || (ownerUserId && ownerUserId === user.id);
        });
      } catch (e) {
        // ignore project lookup errors
      }

      // Return user without password field
      const { password, ...safeUser } = user as any;
      return res.json({ 
        user: {
          ...safeUser,
          displayName: profile?.displayName || (user as any).displayName || user.username,
          display_name: profile?.displayName || (user as any).displayName || user.username,
          level: profile?.level || 1,
          xp: profile?.xp || 0,
          questsCompleted: profile?.questsCompleted || 0,
          quests_completed: profile?.questsCompleted || 0,
          tasksCompleted: profile?.tasksCompleted || 0,
          tasks_completed: profile?.tasksCompleted || 0,
          avatar: profile?.avatar || null,
        },
        hasProfile: !!profile,
        profile: profile || null,
        hasProject: projects.length > 0,
        projectId: projects.length > 0 ? projects[0].id : null
      });
    } catch (e) {
      console.error("/api/me error", e);
      return res.status(500).json({ error: "failed" });
    }
  });

  // Update user profile (display name, avatar, etc.)
  app.post("/api/upload/avatar", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      // Log auth info for debugging upload failures
      try {
        console.log('/api/upload/avatar auth:', { bearer: !!(req.headers.authorization || ''), hasSession: !!sess?.session });
      } catch (logErr) {
        console.warn('failed to log upload auth info', String(logErr));
      }

      if (!sess?.session) return res.status(401).json({ error: "not authenticated" });
      
      const { imageData, fileName } = req.body || {};
      if (!imageData || typeof imageData !== "string") {
        return res.status(400).json({ error: "imageData required as base64 or data URL" });
      }
      
      // Extract base64 data (remove data:image/...;base64, prefix if present)
      const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/);
      const base64Data = base64Match ? base64Match[1] : imageData;
      
      // Generate unique filename
      const ext = fileName?.split('.').pop() || 'png';
      const uniqueName = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      // Prefer S3-compatible object storage in production/serverless
      let publicUrl = null;
      const buffer = Buffer.from(base64Data, 'base64');
      const key = `avatars/${uniqueName}`;

      if (s3Client && S3_BUCKET) {
        try {
          const PutObjectCommand = (s3Client as any).__PutObjectCommand;
          await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: `image/${ext}`,
            // Do not set ACL in most production setups; leave permissions to bucket policy
          }));

          // Determine public URL: prefer explicit S3_PUBLIC_URL env var, otherwise use standard S3 URL format
          if (process.env.S3_PUBLIC_URL) {
            publicUrl = `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
          } else if (S3_REGION) {
            publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
          } else {
            publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
          }
        } catch (s3Err) {
          console.error('S3 upload failed', s3Err);
          return res.status(500).json({ error: 'failed to upload to object storage', detail: String(s3Err) });
        }
      } else {
        // Local filesystem fallback (for development only). In production/serverless this should not be used.
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ error: 'server not configured for file uploads (missing S3_BUCKET)' });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Save file locally
        const filePath = path.join(uploadsDir, uniqueName);
        fs.writeFileSync(filePath, buffer);
        publicUrl = `/uploads/avatars/${uniqueName}`;
      }

      return res.json({ success: true, url: publicUrl });
    } catch (e) {
      console.error("/api/upload/avatar error", e);
      return res.status(500).json({ error: "upload failed", detail: (e && (e as any).message) || String(e) });
    }
  });

  app.put("/api/users/profile", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess) return res.status(401).json({ error: "not authenticated" });

      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) return res.status(404).json({ error: "user not found" });

      const { displayName, avatar, socialProfiles } = req.body || {};
      
      const currentProfile = await storage.getUserProfile(user.id);
      
      await storage.updateUserProfile(user.id, {
        displayName: displayName || user.username,
        avatar: avatar || currentProfile?.avatar || null,
        socialProfiles: socialProfiles || {}
      });

      const updatedUser = await storage.getUser(user.id);
      return res.json({ success: true, user: updatedUser });
    } catch (e) {
      console.error("/api/users/profile PUT error", e);
      return res.status(500).json({ error: "failed to update profile" });
    }
  });

  const httpServer = createServer(app);

  // initialize websocket notifications
  try {
    const { initWebsocketServer } = await import("./notifications");
    initWebsocketServer(httpServer as any);
  } catch (e) {
    console.warn("ws init failed", e);
  }

  // Start mint worker module (will be idle until jobs are enqueued)
  try {
    const { default: worker } = await import("./mintWorker");
    // no-op: module side-effects are sufficient
  } catch (e) {
    console.warn("mint worker failed to load", e);
  }

  // API: add XP to a user. Body: { userId, xp, questId (optional) }
  app.post("/api/xp/add", async (req, res) => {
    try {
      const { userId, xp, questId, questsCompletedDelta = 0, tasksCompletedDelta = 0 } = req.body || {};
      console.log(`/api/xp/add called with`, { userId, xp, questId, questsCompletedDelta, tasksCompletedDelta });
      
      if (!userId || typeof xp !== "number") {
        console.warn('/api/xp/add invalid payload', req.body);
        return res.status(400).json({ error: "userId and numeric xp required" });
      }
      
      // If questId is provided, check if already completed AND record it atomically
      if (questId) {
        const alreadyCompleted = await storage.isQuestCompleted(userId, questId);
        if (alreadyCompleted) {
          console.log(`[/api/xp/add] Quest ${questId} already completed by user ${userId}`);
          return res.status(409).json({ 
            error: "Quest already completed",
            message: "You have already claimed this quest."
          });
        }
        
        // Record completion BEFORE awarding XP to prevent race conditions
        // The database UNIQUE constraint will prevent duplicates even in concurrent requests
        try {
          await storage.recordQuestCompletion(userId, questId, xp);
          console.log(`[/api/xp/add] Recorded completion of quest ${questId} for user ${userId}`);
        } catch (e: any) {
          // If this fails due to duplicate key (concurrent request), return 409
          const isDuplicate = 
            e?.code === 'DUPLICATE_QUEST_COMPLETION' || // MemStorage
            e?.code === '23505' || // PostgreSQL unique violation
            e?.message?.includes('duplicate') || 
            e?.constraint?.includes('user_quest_completions');
          
          if (isDuplicate) {
            console.log(`[/api/xp/add] Duplicate quest completion detected for ${questId} by user ${userId}`);
            return res.status(409).json({ 
              error: "Quest already completed",
              message: "You have already claimed this quest."
            });
          }
          console.error(`[/api/xp/add] Failed to record quest completion:`, e);
          return res.status(500).json({ error: "Failed to record quest completion" });
        }
      }
      
      const result = await storage.addXpToUser(userId, xp, {
        questsCompletedInc: questsCompletedDelta,
        tasksCompletedInc: tasksCompletedDelta,
      });
      console.log(`/api/xp/add result for userId=${userId}:`, result);
      
      // if leveled up, create a mint record and enqueue job
      if (result.newLevel > result.previousLevel) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        const level = result.newLevel;
        const user = await storage.getUser(userId);
        const address = (user as any)?.address || null;
        await storage.createOrGetLevelNftRecord({ userId, level, status: "queued", jobId });
        if (address) {
          const { enqueueMint } = await import("./mintWorker");
          enqueueMint({ jobId, userId, level, address });
        }
      }
      return res.json(result);
    } catch (err) {
      console.error("add xp error", err);
      return res.status(500).json({ error: "failed to add xp" });
    }
  });

  // Task management endpoints
  app.get("/api/tasks", async (req, res) => {
    try {
      const { type } = req.query;
      const tasks = await storage.getAllTasks(type as string);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/completed/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const completedTaskIds = await storage.getUserCompletedTasks(userId);
      res.json({ completedTasks: completedTaskIds });
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      res.status(500).json({ error: "Failed to fetch completed tasks" });
    }
  });

  app.post("/api/tasks/claim", async (req, res) => {
    try {
      const { userId, taskId } = req.body || {};
      console.log(`/api/tasks/claim called with`, { userId, taskId });
      
      if (!userId || !taskId) {
        return res.status(400).json({ error: "userId and taskId required" });
      }

      // Check if task exists
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Check if already completed
      const alreadyCompleted = await storage.isTaskCompleted(userId, taskId);
      if (alreadyCompleted) {
        console.log(`[/api/tasks/claim] Task ${taskId} already completed by user ${userId}`);
        return res.status(409).json({ 
          error: "Task already completed",
          message: "You have already claimed this task."
        });
      }

      // Record completion BEFORE awarding XP to prevent race conditions
      try {
        await storage.recordTaskCompletion(userId, taskId, task.xpReward);
        console.log(`[/api/tasks/claim] Recorded completion of task ${taskId} for user ${userId}`);
      } catch (e: any) {
        // If this fails due to duplicate (concurrent request), return 409
        const isDuplicate = 
          e?.code === 'DUPLICATE_TASK_COMPLETION' ||
          e?.code === '23505' ||
          e?.message?.includes('duplicate');
        
        if (isDuplicate) {
          console.log(`[/api/tasks/claim] Duplicate task completion detected for ${taskId} by user ${userId}`);
          return res.status(409).json({ 
            error: "Task already completed",
            message: "You have already claimed this task."
          });
        }
        console.error(`[/api/tasks/claim] Failed to record task completion:`, e);
        return res.status(500).json({ error: "Failed to record task completion" });
      }

      // Award XP with proper quest/task counters
      const result = await storage.addXpToUser(userId, task.xpReward, {
        questsCompletedInc: task.questIncrement || 0,
        tasksCompletedInc: task.taskIncrement || 0,
      });
      console.log(`/api/tasks/claim result for userId=${userId}:`, result);

      // Handle level-up NFT minting
      if (result.newLevel > result.previousLevel) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        const level = result.newLevel;
        const user = await storage.getUser(userId);
        const address = (user as any)?.address || null;
        await storage.createOrGetLevelNftRecord({ userId, level, status: "queued", jobId });
        if (address) {
          const { enqueueMint } = await import("./mintWorker");
          enqueueMint({ jobId, userId, level, address });
        }
      }

      return res.json({ 
        success: true, 
        result,
        task: {
          id: task.id,
          title: task.title,
          xpReward: task.xpReward
        }
      });
    } catch (err) {
      console.error("task claim error", err);
      return res.status(500).json({ error: "failed to claim task" });
    }
  });

  // Request server to mint level badge for a user/level (idempotent)
  app.post("/api/tiers/mint", async (req, res) => {
    try {
      const { userId, level } = req.body || {};
      if (!userId || typeof level !== "number") return res.status(400).json({ error: "userId and level required" });
      const keyRecord = await storage.getLevelNftRecord(userId, level);
      if (keyRecord && keyRecord.txHash) return res.json({ status: "already_minted", record: keyRecord });
      const user = await storage.getUser(userId);
      const address = (user as any)?.address;
      if (!address) return res.status(400).json({ error: "user has no wallet address" });
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      await storage.createOrGetLevelNftRecord({ userId, level, status: "queued", jobId });
      const { enqueueMint } = await import("./mintWorker");
      enqueueMint({ jobId, userId, level, address });
      return res.json({ status: "queued", jobId });
    } catch (err) {
      console.error("mint request failed", err);
      return res.status(500).json({ error: "failed to queue mint" });
    }
  });

  app.get("/api/tiers/mint/:userId/:level", async (req, res) => {
    try {
      const { userId, level } = req.params;
      const rec = await storage.getLevelNftRecord(userId, Number(level));
      if (!rec) return res.status(404).json({ error: "not found" });
      return res.json(rec);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "failed" });
    }
  });

  // Campaigns API
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      return res.json(campaigns);
    } catch (err) {
      console.error("get campaigns error", err);
      return res.status(500).json({ error: "failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ error: "campaign not found" });
      }
      return res.json(campaign);
    } catch (err) {
      console.error("get campaign error", err);
      return res.status(500).json({ error: "failed to fetch campaign" });
    }
  });

  // Leaderboard endpoint: fetch top users by XP with proper user data
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(String(req.query.limit || '100'), 10);
      
      if ((storage as any).pool) {
        const result = await (storage as any).query(`
          SELECT 
            u.id,
            u.username,
            u.address,
            p.display_name,
            p.avatar,
            COALESCE(p.xp, 0) as xp,
            COALESCE(p.level, 1) as level,
            COALESCE(p.quests_completed, 0) as quests_completed,
            COALESCE(p.tasks_completed, 0) as tasks_completed
          FROM users u
          LEFT JOIN user_profiles p ON u.id = p.user_id
          WHERE COALESCE(p.xp, 0) > 0
          ORDER BY COALESCE(p.xp, 0) DESC, COALESCE(p.level, 1) DESC
          LIMIT $1
        `, [limit]);
        return res.json(result.rows || []);
      }
      
      const users = [] as any[];
      const memStorage = storage as any;
      
      if (memStorage.userProfiles && memStorage.userProfiles.entries) {
        for (const [userId, profile] of memStorage.userProfiles.entries()) {
          if (!profile || (profile.xp || 0) <= 0) continue;
          
          const user = await storage.getUser(userId);
          if (user) {
            const displayName = profile.displayName || (user as any).displayName || user.username;
            users.push({
              id: user.id,
              username: user.username,
              address: (user as any).address || null,
              display_name: displayName,
              xp: profile.xp || 0,
              level: profile.level || 1,
              quests_completed: profile.questsCompleted || 0,
              tasks_completed: profile.tasksCompleted || 0,
            });
          }
        }
      }
      
      users.sort((a, b) => {
        const xpDiff = (b.xp || 0) - (a.xp || 0);
        if (xpDiff !== 0) return xpDiff;
        return (b.level || 1) - (a.level || 1);
      });
      return res.json(users.slice(0, limit));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Projects API: create/list/get projects (simple in-memory persistence for dev)
  app.post("/projects", async (req, res) => {
    try {
      const body = req.body || {};
      // expect at least name and ownerAddress
      if (!body.name || !body.ownerAddress) return res.status(400).json({ error: "name and ownerAddress required" });
      const project = await storage.createProject(body);
      return res.status(201).json(project);
    } catch (err) {
      console.error("create project failed", err);
      return res.status(500).json({ error: "create project failed" });
    }
  });

  app.get("/projects", async (req, res) => {
    try {
      const list = await storage.listProjects();
      return res.json(list);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed to list projects" });
    }
  });

  app.get("/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const p = await storage.getProjectById(id);
      if (!p) return res.status(404).json({ error: "not found" });
      return res.json(p);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed to fetch project" });
    }
  });

  // Campaign Tasks API
  app.post("/api/campaigns/:campaignId/tasks", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess?.session) return res.status(401).json({ error: "not authenticated" });
      
      const { campaignId } = req.params;
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) return res.status(404).json({ error: "campaign not found" });
      
      // TODO: Validate project ownership/permissions
      
      const taskData = {
        ...req.body,
        campaignId,
        projectId: campaign.project_id,
      };
      
      const task = await storage.createCampaignTask(taskData);
      return res.status(201).json(task);
    } catch (err) {
      console.error("[POST /api/campaigns/:campaignId/tasks]", err);
      return res.status(500).json({ error: "failed to create task" });
    }
  });

  app.get("/api/campaigns/:campaignId/tasks", async (req, res) => {
    try {
      const { campaignId } = req.params;
      const tasks = await storage.getCampaignTasks(campaignId);
      return res.json(tasks);
    } catch (err) {
      console.error("[GET /api/campaigns/:campaignId/tasks]", err);
      return res.status(500).json({ error: "failed to fetch tasks" });
    }
  });

    // Quests API: list completed quests for a user
    app.get('/api/quests/completed/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'userId required' });
        const completed = await storage.getUserCompletedQuests(userId);
        return res.json({ completed });
      } catch (e) {
        console.error('[GET /api/quests/completed/:userId] error', e);
        return res.status(500).json({ error: 'failed to fetch completed quests' });
      }
    });

    // Quests API: list canonical quests (server-side catalog)
    app.get('/api/quests', async (req, res) => {
      try {
        const q = await storage.getAllQuests();
        return res.json({ quests: q });
      } catch (e) {
        console.error('[GET /api/quests] error', e);
        return res.status(500).json({ error: 'failed to fetch quests' });
      }
    });

    app.get('/api/quests/:id', async (req, res) => {
      try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'quest id required' });
        const q = await storage.getQuestById(id);
        if (!q) return res.status(404).json({ error: 'quest not found' });
        return res.json({ quest: q });
      } catch (e) {
        console.error('[GET /api/quests/:id] error', e);
        return res.status(500).json({ error: 'failed to fetch quest' });
      }
    });

    // Quests API: compute claimable XP for a set of quest ids supplied by the client
    // Expects body { userId: string, quests: Array<{ id: string, xp: number }> }
    app.post('/api/quests/claimable', async (req, res) => {
      try {
        const { userId, quests } = req.body || {};
        if (!userId) return res.status(400).json({ error: 'userId required' });
        if (!Array.isArray(quests)) return res.status(400).json({ error: 'quests array required' });

        let total = 0;
        const perId: Record<string, number> = {};

        for (const q of quests) {
          if (!q || !q.id) continue;
          const xp = Number(q.xp || 0) || 0;
          try {
            const done = await storage.isQuestCompleted(userId, q.id);
            if (!done) {
              total += xp;
              perId[q.id] = xp;
            } else {
              perId[q.id] = 0;
            }
          } catch (e) {
            // If storage check fails, assume not completed to avoid hiding rewards
            perId[q.id] = xp;
            total += xp;
          }
        }

        return res.json({ total, perId });
      } catch (e) {
        console.error('[POST /api/quests/claimable] error', e);
        return res.status(500).json({ error: 'failed to compute claimable xp' });
      }
    });

    // Quests API: claim a quest (wrapper over /api/xp/add) - ensures idempotency and returns updated profile
    app.post('/api/quests/claim', async (req, res) => {
      try {
        const { userId, questId, xp } = req.body || {};
        if (!userId || !questId || typeof xp !== 'number') return res.status(400).json({ error: 'userId, questId and numeric xp required' });

        // Check duplicate
        const already = await storage.isQuestCompleted(userId, questId);
        if (already) return res.status(409).json({ error: 'Quest already claimed' });

        // Record completion and award xp (atomic at application level for MemStorage)
        try {
          await storage.recordQuestCompletion(userId, questId, xp);
        } catch (e: any) {
          const isDuplicate = e?.code === 'DUPLICATE_QUEST_COMPLETION' || e?.code === '23505' || e?.message?.includes('duplicate');
          if (isDuplicate) return res.status(409).json({ error: 'Quest already claimed' });
          console.error('[POST /api/quests/claim] recordQuestCompletion failed', e);
          return res.status(500).json({ error: 'failed to record quest completion' });
        }

        const result = await storage.addXpToUser(userId, xp, { questsCompletedInc: 1 });

        return res.json({ success: true, result });
      } catch (e) {
        console.error('[POST /api/quests/claim] error', e);
        return res.status(500).json({ error: 'failed to claim quest' });
      }
    });

  app.put("/api/campaigns/:campaignId/tasks/:taskId", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess?.session) return res.status(401).json({ error: "not authenticated" });
      
      const { campaignId, taskId } = req.params;
      const task = await storage.getCampaignTask(taskId);
      if (!task) return res.status(404).json({ error: "task not found" });
      if (task.campaignId !== campaignId) return res.status(400).json({ error: "task does not belong to campaign" });
      
      // TODO: Validate project ownership/permissions
      
      await storage.updateCampaignTask(taskId, req.body);
      const updated = await storage.getCampaignTask(taskId);
      return res.json(updated);
    } catch (err) {
      console.error("[PUT /api/campaigns/:campaignId/tasks/:taskId]", err);
      return res.status(500).json({ error: "failed to update task" });
    }
  });

  app.delete("/api/campaigns/:campaignId/tasks/:taskId", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess?.session) return res.status(401).json({ error: "not authenticated" });
      
      const { campaignId, taskId } = req.params;
      const task = await storage.getCampaignTask(taskId);
      if (!task) return res.status(404).json({ error: "task not found" });
      if (task.campaignId !== campaignId) return res.status(400).json({ error: "task does not belong to campaign" });
      
      // TODO: Validate project ownership/permissions
      
      await storage.deleteCampaignTask(taskId);
      return res.json({ success: true });
    } catch (err) {
      console.error("[DELETE /api/campaigns/:campaignId/tasks/:taskId]", err);
      return res.status(500).json({ error: "failed to delete task" });
    }
  });

  app.get("/api/campaigns/:campaignId/tasks/completed/:userId", async (req, res) => {
    try {
      const { campaignId, userId } = req.params;
      const completedTaskIds = await storage.getUserCampaignTaskCompletions(userId, campaignId);
      return res.json({ taskIds: completedTaskIds });
    } catch (err) {
      console.error("[GET /api/campaigns/:campaignId/tasks/completed/:userId]", err);
      return res.status(500).json({ error: "failed to fetch completions" });
    }
  });

  app.post("/api/campaigns/:campaignId/tasks/:taskId/claim", async (req, res) => {
    try {
      const sess = await getSessionFromReq(req);
      if (!sess?.session) return res.status(401).json({ error: "not authenticated" });
      
      const { campaignId, taskId } = req.params;
      let user = null;
      if (sess.session.userId) {
        user = await storage.getUser(sess.session.userId);
      } else {
        user = await storage.getUserByAddress(sess.session.address);
      }
      if (!user) return res.status(404).json({ error: "user not found" });
      
      const task = await storage.getCampaignTask(taskId);
      if (!task) return res.status(404).json({ error: "task not found" });
      if (task.campaignId !== campaignId) return res.status(400).json({ error: "task does not belong to campaign" });
      
      const alreadyCompleted = await storage.isCampaignTaskCompleted(user.id, taskId);
      if (alreadyCompleted) return res.status(409).json({ error: "task already completed", code: "DUPLICATE_CAMPAIGN_TASK_COMPLETION" });
      
      // Record completion
      await storage.recordCampaignTaskCompletion(user.id, taskId, campaignId, task.xpReward || 0, req.body.verificationData);
      
      // Award XP
      const result = await storage.addXpToUser(user.id, task.xpReward || 0, { questsCompletedInc: 1 });
      
      return res.json({
        success: true,
        xpAwarded: task.xpReward || 0,
        newLevel: result.newLevel,
        newXp: result.xp,
      });
    } catch (err: any) {
      if (err.code === 'DUPLICATE_CAMPAIGN_TASK_COMPLETION') {
        return res.status(409).json({ error: "task already completed", code: err.code });
      }
      console.error("[POST /api/campaigns/:campaignId/tasks/:taskId/claim]", err);
      return res.status(500).json({ error: "failed to claim task" });
    }
  });

  app.listen(5051, () => console.log("Server running on 5051"));
  return httpServer;
}
