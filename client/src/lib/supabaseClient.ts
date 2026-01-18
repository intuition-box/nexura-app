// Supabase has been removed as a client-side dependency.
// This module used to return a Supabase client; it now returns null so code paths
// that attempted to use Supabase will fall back to server-side HTTP endpoints.

export default null as any;
