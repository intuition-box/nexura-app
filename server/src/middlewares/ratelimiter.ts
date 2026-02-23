import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response } from "express";

export const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit:(req: GlobalRequest) => {
		const auth = req.headers?.authorization;

		if (auth) return 50;

		return 10;
	}, // limit each user to 10 or 50 requests per windowMs
  message: {
    error: 'Too many requests from this user, please try again later.',
    retryAfter: '10 minutes'
  },
  keyGenerator: (req: Request, res: Response): string => {

    return req.headers?.authorization ?? "";
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});
