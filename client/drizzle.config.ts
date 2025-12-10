import { defineConfig } from "drizzle-kit";

// Prefer a Neon/Postgres URL when present. Accept NEON_DATABASE_URL or DATABASE_URL.
// If none is set, fall back to the provided Neon connection string (development convenience).
if (!process.env.DATABASE_URL) {
  if (process.env.NEON_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.NEON_DATABASE_URL;
  }
}

// Development fallback (you provided this Neon connection string).
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_g4BOXLHIw9uv@ep-super-dawn-ahjzzy2h-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});