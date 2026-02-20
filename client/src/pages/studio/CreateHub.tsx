"use client";

import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { projectApiRequest, storeProjectSession, base64ToBlob } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";

export default function SharedAccessCredentials() {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isLongEnough, setIsLongEnough] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleSignUp() {
    if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecialChar) {
      toast({ title: "Weak password", description: "Password does not meet all requirements.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Password mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!email) {
      toast({ title: "Missing email", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    if (!address) {
      toast({ title: "Missing address", description: "Please enter your project wallet address.", variant: "destructive" });
      return;
    }

    const hubDataRaw = localStorage.getItem("hubData");
    if (!hubDataRaw) {
      toast({ title: "Missing hub details", description: "Please complete the hub setup step first.", variant: "destructive" });
      setLocation("/projects/create/the-hub");
      return;
    }

    const hubData: { hubName?: string; description?: string; imagePreview?: string } = JSON.parse(hubDataRaw);

    if (!hubData.hubName) {
      toast({ title: "Missing hub name", description: "Please go back and enter a hub name.", variant: "destructive" });
      setLocation("/projects/create/the-hub");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", hubData.hubName);
      fd.append("email", email);
      fd.append("description", hubData.description ?? "");
      fd.append("address", address);
      fd.append("password", password);

      if (hubData.imagePreview) {
        const blob = base64ToBlob(hubData.imagePreview);
        fd.append("logo", blob, "logo.png");
      }

      const res = await projectApiRequest<{ message?: string; accessToken?: string; token?: string; project?: Record<string, unknown> }>({
        method: "POST",
        endpoint: "/project/sign-up",
        formData: fd,
      });

      const token = (res.token ?? res.accessToken) as string | undefined;
      if (!token) throw new Error("No access token received");

      storeProjectSession(token, { name: hubData.hubName, email, address, ...(res.project ?? {}) });

      localStorage.removeItem("hubData");

      toast({ title: "Hub created!", description: "Your project hub is live on Nexura Studio." });
      setLocation("/studio-dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-up failed. Please try again.";
      toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />

      {/* Outer container */}
      <div className="max-w-3xl mx-auto relative z-10 p-6 sm:p-8 border-2 border-purple-500 rounded-3xl space-y-6">

        <div className="max-w-2xl mx-auto relative z-10 space-y-4">
          {/* Header */}
          <div className="text-center py-8 sm:py-12 px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
              Shared Access Credentials
            </h1>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed">
              Set up credentials that will allow your team members to access your hub on Nexura Studio
            </p>
          </div>

          {/* Credentials Card */}
          <Card className="border-2 border-purple-500 rounded-3xl p-6 space-y-6 bg-gray-900">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <CardTitle className="text-white text-lg sm:text-xl">Email Address</CardTitle>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full bg-gray-800 text-white border-purple-500"
                />
              </div>

              {/* Wallet Address */}
              <div>
                <CardTitle className="text-white text-lg sm:text-xl">Project Wallet Address</CardTitle>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-2 w-full bg-gray-800 text-white border-purple-500"
                />
              </div>

              {/* Password */}
              <div>
                <CardTitle className="text-white text-lg sm:text-xl">Password</CardTitle>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="*   *   *   *   *   *   *   *"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      setHasUppercase(/[A-Z]/.test(value));
                      setHasNumber(/\d/.test(value));
                      setHasSpecialChar(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/.test(value));
                      setIsLongEnough(value.length >= 8);
                    }}
                    className="mt-2 w-full bg-gray-800 text-white border-purple-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-4 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <p className={isLongEnough ? "text-green-400" : "text-red-400"}>â€¢ At least 8 characters</p>
                  <p className={hasUppercase ? "text-green-400" : "text-red-400"}>â€¢ 1 uppercase letter</p>
                  <p className={hasNumber ? "text-green-400" : "text-red-400"}>â€¢ 1 number</p>
                  <p className={hasSpecialChar ? "text-green-400" : "text-red-400"}>â€¢ 1 special character</p>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <CardTitle className="text-white text-lg sm:text-xl">Confirm Password</CardTitle>
                <div className="relative mt-2">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="*   *   *   *   *   *   *   *"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-800 text-white border-purple-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 bg-gray-800 p-4 rounded-lg mt-2">
                <div className="flex-shrink-0 text-blue-400 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 110-17 8.5 8.5 0 010 17z" />
                  </svg>
                </div>
                <CardDescription className="text-white/60 text-sm">
                  Disclaimer: Anyone with these credentials can manage your campaign and hub settings.
                </CardDescription>
              </div>
            </div>

            <CardFooter className="pt-4">
              <Button
                onClick={handleSignUp}
                className="w-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? "Creating hub..." : "Create Hub"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
