import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { projectApiRequest, storeProjectSession } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";

export default function SignInToHub() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await projectApiRequest<{ message?: string; accessToken?: string; token?: string; project?: Record<string, unknown>; admin?: { _id: string; name: string; email: string; role: string; hub?: string } }>({
        method: "POST",
        endpoint: "/hub/sign-in",
        data: { email, password, role: "project" },
      });

      const token = (res.token ?? res.accessToken) as string | undefined;
      if (!token) throw new Error("No access token received");

      // Store token first so subsequent authenticated requests work
      storeProjectSession(token, { email, role: res.admin?.role ?? "admin", adminId: res.admin?._id ?? "" });

      // Fetch project profile to get name and logo
      try {
        const { hub } = await projectApiRequest<{ hub: Record<string, any> }>({
          method: "GET",
          endpoint: "/hub/me",
        });
        storeProjectSession(token, { email, name: hub.name ?? email, logo: hub.logo ?? "", role: res.admin?.role ?? "admin", adminId: res.admin?._id ?? "" });
      } catch {
        // profile fetch failed — keep email as name
      }

      toast({ title: "Signed in!", description: "Welcome back to Nexura Studio." });
      setLocation("/studio-dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials.";
      toast({ title: "Sign in failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!resetEmail) {
      toast({ title: "Missing email", description: "Please enter your email.", variant: "destructive" });
      return;
    }

    setResetLoading(true);
    try {
      await projectApiRequest({
        method: "POST",
        endpoint: "/hub/forgot-password",
        data: { email: resetEmail, role: "project" },
      });
      toast({ title: "Email sent!", description: `Password reset instructions sent to ${resetEmail}.` });
      setShowResetModal(false);
      setResetEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-md mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center py-4 sm:py-6 px-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Sign in to Your Hub
          </h1>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            Enter your credentials to access your existing your project's Hub.
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="border-2 border-purple-500 rounded-3xl p-6 space-y-6 bg-gray-900">
          {/* Email */}
          <div>
            <CardTitle className="text-white text-lg sm:text-xl">Email Address</CardTitle>
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mt-2 w-full bg-gray-800 text-white border-purple-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg sm:text-xl">Password</CardTitle>
              <button
                type="button"
                className="text-sm text-blue-400 hover:underline"
                onClick={() => setShowResetModal(true)}
              >
                Forgotten password?
              </button>
            </div>
            <div className="relative mt-2">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="*   *   *   *   *   *   *   *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-800 text-white border-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Footer / Button */}
          <CardFooter className="pt-4">
            <Button
              onClick={handleSignIn}
              className="w-full bg-purple-400 border-0 text-white hover:bg-purple-600 hover:shadow-[0_0_28px_rgba(131,58,253,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-white/30 -mt-8">
          Don't have an account?{" "}
          <a href="/projects/create" className="text-purple-400 hover:underline">
            Create a Hub
          </a>
        </p>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-purple-500/20 rounded-2xl p-7 w-full max-w-md space-y-6 animate-modal-pop shadow-[0_0_60px_rgba(131,58,253,0.2)]">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <p className="text-white/50 text-sm">
                Enter your email address and we’ll send you an email with instructions to reset your password.
              </p>
            </div>

            <div>
              <label className="text-white/60 text-sm block mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full bg-white/5 text-white border-white/10 focus:border-purple-500 placeholder:text-white/30 mt-0"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(131,58,253,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {resetLoading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
