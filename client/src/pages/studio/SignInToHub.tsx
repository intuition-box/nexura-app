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
      const res = await projectApiRequest<{ message?: string; accessToken?: string; token?: string; project?: Record<string, unknown> }>({
        method: "POST",
        endpoint: "/project/sign-in",
        data: { email, password, role: "project" },
      });

      const token = (res.token ?? res.accessToken) as string | undefined;
      if (!token) throw new Error("No access token received");

      storeProjectSession(token, { email, ...(res.project ?? {}) });
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
        endpoint: "/project/forgot-password",
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

      <div className="max-w-2xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center py-8 sm:py-12 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
            Sign in to Your Hub
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed">
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
              className="w-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-2 border-purple-500 rounded-3xl p-6 w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-white/60 text-sm">
                Enter your email address and we’ll send you an email with instructions to reset your password.
              </p>
            </div>

            <div>
              <CardTitle className="text-white text-sm">Email Address</CardTitle>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-2 w-full bg-gray-800 text-white border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                className="bg-purple-500 hover:bg-purple-600"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Reset Password"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
