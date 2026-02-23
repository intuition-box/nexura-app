import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response } from "express";

export const signInLimiter = rateLimit({
  windowMs: 3 * 60 * 60 * 1000, // 3 hours
  limit: 4, // limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '3 hours'
  },
  keyGenerator: (req: Request, res: Response): string => {
    if (!req.ip) {
      console.error('Warning: req.ip is missing!');
      return req.socket.remoteAddress || "";
    }

    return ipKeyGenerator(req.ip);
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});
