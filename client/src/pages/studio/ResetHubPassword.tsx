import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Check, Eye, EyeOff, KeyRound, X } from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { projectApiRequest, storeProjectSession } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";

export default function ResetHubPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const pwdChecks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    upper: /[A-Z]/.test(password),
  };
  const allPwdValid = Object.values(pwdChecks).every(Boolean);

  const handleResetPassword = async () => {
    if (!token) {
      setPageError("This reset link is invalid. Request a new password reset email.");
      return;
    }

    if (!password || !confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in both password fields.", variant: "destructive" });
      return;
    }

    if (!allPwdValid) {
      toast({ title: "Weak password", description: "Please meet all password requirements.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Make sure both passwords are the same.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const res = await projectApiRequest<{
        message?: string;
        accessToken?: string;
        token?: string;
        admin?: { _id: string; name: string; email: string; role: string; hub?: string };
      }>({
        method: "POST",
        endpoint: "/hub/reset-password",
        data: { token, password },
      });

      const accessToken = (res.token ?? res.accessToken) as string | undefined;
      if (!accessToken || !res.admin) {
        throw new Error("No access token received");
      }

      storeProjectSession(accessToken, {
        email: res.admin.email,
        name: res.admin.name,
        role: res.admin.role,
        adminId: res.admin._id,
      });

      try {
        const { hub } = await projectApiRequest<{ hub: Record<string, any> }>({
          method: "GET",
          endpoint: "/hub/me",
        });

        storeProjectSession(accessToken, {
          email: res.admin.email,
          name: hub.name ?? res.admin.name ?? res.admin.email,
          logo: hub.logo ?? "",
          role: res.admin.role,
          adminId: res.admin._id,
        });
      } catch {
        // Keep the basic admin session if hub profile fetch fails.
      }

      toast({ title: "Password updated", description: "Your password has been reset successfully." });
      setLocation("/studio-dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password.";
      setPageError(message);
      toast({ title: "Reset failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-md mx-auto relative z-10 space-y-6 py-6">
        <div className="text-center py-4 sm:py-6 px-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Reset Your Studio Password
          </h1>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            Create a new password to regain access to your Nexura Studio dashboard.
          </p>
        </div>

        <Card className="border-2 border-purple-500 rounded-3xl p-6 space-y-6 bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 border border-purple-500/20">
              <KeyRound className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">New Password</CardTitle>
              <p className="text-sm text-white/50">Use a strong password you have not used before.</p>
            </div>
          </div>

          {pageError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {pageError}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1 ml-1">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a new password"
                  className="w-full bg-gray-800 text-white border-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1 ml-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full bg-gray-800 text-white border-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {password.length > 0 ? (
              <ul className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                {([
                  [pwdChecks.length, "At least 8 characters"],
                  [pwdChecks.upper, "At least one uppercase letter"],
                  [pwdChecks.number, "At least one number"],
                  [pwdChecks.special, "At least one special character"],
                ] as [boolean, string][]).map(([ok, label]) => (
                  <li key={label} className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-400" : "text-white/40"}`}>
                    {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleResetPassword}
              className="w-full bg-[#8B3EFE] border-0 text-white hover:bg-[#8B3EFE] hover:shadow-[0_0_28px_rgba(131,58,253,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Update Password"}
              <ArrowRight className="h-5 w-5" />
            </Button>

            <button
              type="button"
              onClick={() => setLocation("/projects/create/signin-to-hub")}
              className="text-sm text-purple-300 hover:text-white transition-colors"
            >
              Back to studio sign in
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
