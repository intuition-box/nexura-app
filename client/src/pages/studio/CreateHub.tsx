"use client";

import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function SharedAccessCredentials() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
const [hasNumber, setHasNumber] = useState(false);
const [hasSpecialChar, setHasSpecialChar] = useState(false);
const [isLongEnough, setIsLongEnough] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  function handleSignUp() {
  // Basic empty check
if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecialChar) {
  alert("Password does not meet all requirements");
  return;
}


  // Email validation for gmail, yahoo, or outlook
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;
  if (!emailRegex.test(email)) {
    alert("Email must be a valid Gmail, Yahoo, or Outlook address");
    return;
  }

  // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    alert(
      "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character"
    );
    return;
  }

  // Confirm password match
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  setLoading(true);
  setTimeout(() => {
    alert(`Hub credentials created for ${email} (placeholder)`);
    setLoading(false);
  }, 1000);
  
}


  return (
<div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
  <AnimatedBackground />

  {/* Outer container */}
  <div className="max-w-3xl mx-auto relative z-10 p-6 sm:p-8 border-2 border-purple-500 rounded-3xl space-y-6">

  <div className="max-w-2xl mx-auto relative z-10 space-y-4"> {/* Wider container */}
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

      // Check rules
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
    className="absolute right-2 top-2 text-gray-400 hover:text-white"
  >
    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
</div>

              <div className="mt-2 space-y-1 text-sm">
  <p className={isLongEnough ? "text-green-400" : "text-red-400"}>
    • At least 8 characters
  </p>
  <p className={hasUppercase ? "text-green-400" : "text-red-400"}>
    • 1 uppercase letter
  </p>
  <p className={hasNumber ? "text-green-400" : "text-red-400"}>
    • 1 number
  </p>
  <p className={hasSpecialChar ? "text-green-400" : "text-red-400"}>
    • 1 special character
  </p>
</div>


            </div>

            <div className="relative">
  <Input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="*   *   *   *   *   *   *   *"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="mt-2 w-full bg-gray-800 text-white border-purple-500 pr-10"
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute right-2 top-2 text-gray-400 hover:text-white"
  >
    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
</div>


            <div className="flex items-start gap-3 bg-gray-800 p-4 rounded-lg mt-2">
  {/* Info icon */}
  <div className="flex-shrink-0 text-blue-400 mt-0.5">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 110-17 8.5 8.5 0 010 17z" />
    </svg>
  </div>
  {/* Text */}
  <CardDescription className="text-white/60 text-sm">
    Disclaimer: Anyone with these credentials can manage your campaign and hub settings
  </CardDescription>
</div>
</div>

          <CardFooter className="pt-4">

            <Link href="/projects/create/the-hub">
            <Button
  onClick={handleSignUp}
  className="w-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
  disabled={loading}
>
  {loading ? "Creating..." : "Sign Up"}
  <ArrowRight className="h-5 w-5" />
</Button>
</Link>

          </CardFooter>
        </Card>
      </div>
      </div>
    </div>
  );
}
