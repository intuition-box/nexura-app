import React from "react";
import { useAuth } from "../lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return null;
  return <>{children}</>;
}
