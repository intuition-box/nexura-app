"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

/* =======================
   SVG ICONS (BOLD / FILLED)
======================= */

const InviteIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Z" />
    <path d="M12 14.5c-4.2 0-7.5 2.2-7.5 5v1h15v-1c0-2.8-3.3-5-7.5-5Z" />
    <path d="M19 7V5.5a.8.8 0 0 0-1.6 0V7h-1.5a.8.8 0 0 0 0 1.6h1.5v1.5a.8.8 0 0 0 1.6 0V8.6h1.5a.8.8 0 0 0 0-1.6Z" />
  </svg>
);

const RegisterIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM7 12h10v2H7v-2Zm0 4h10v2H7v-2Z" />
  </svg>
);

const EarnIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a1 1 0 0 1 1 1v1.1c2.6.3 4.5 2 4.5 4.4h-2.2c0-1.3-1-2.2-2.8-2.2s-2.7.8-2.7 2c0 1.3 1.3 1.8 3.2 2.2 2.5.6 4.8 1.6 4.8 4.4 0 2.4-1.9 4-4.8 4.4V21a1 1 0 0 1-2 0v-1.1c-2.9-.4-5-2.2-5-4.9h2.3c0 1.6 1.3 2.7 3.5 2.7 2 0 3-1 3-2.2 0-1.4-1.2-1.9-3.5-2.5-2.4-.6-4.5-1.5-4.5-4.2 0-2.3 1.8-3.9 4.2-4.3V3a1 1 0 0 1 1-1Z" />
  </svg>
);

const UsersIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-3.3 0-6 1.7-6 4v1h8v-1c0-1.5.8-2.8 2-3.6A8.2 8.2 0 0 0 8 13Zm8 0c-3.3 0-6 1.7-6 4v1h12v-1c0-2.3-2.7-4-6-4Z" />
  </svg>
);

const ActiveIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4Z" />
  </svg>
);

const TrustIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="m12 2 2.9 6.3 6.8.6-5.1 4.4 1.6 6.7L12 16.8 5.8 20l1.6-6.7L2.3 8.9l6.8-.6Z" />
  </svg>
);

/* =======================
   PAGE
======================= */

export default function ReferralsPage() {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = "nexura.com/referral-noobmaster";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleClaim = () => {
    setRewardClaimed(true);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-[1200px] mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Referrals</h1>
        <p className="text-sm opacity-60 mt-1">
          Invite your friends to Nexura and earn rewards
        </p>
      </div>

      {/* STEPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {[
          { icon: InviteIcon, title: "Send an invitation", desc: "Send your referral links to friends and tell them how cool Nexura is!" },
          { icon: RegisterIcon, title: "Registration", desc: "Let them register to our platform using your referral links" },
          { icon: EarnIcon, title: "Earn", desc: "You can earn up to 16.2 TRUST referring your friends after they complete a Quest or Campaign" }
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-600/25 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.35)]">
              <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-purple-300" />
            </div>
            <p className="text-sm sm:text-base font-medium">{title}</p>
            <p className="text-xs sm:text-sm opacity-60 max-w-[240px]">{desc}</p>
          </div>
        ))}
      </div>

      {/* SHARE LINK */}
      <div className="space-y-6">
        <div>
          <p className="text-base sm:text-lg font-medium">Share your referral link</p>
          <p className="text-sm opacity-60 mt-1 max-w-[560px]">
            Copy and share your referral link to start earning rewards.
          </p>
        </div>

        <div className="flex items-center bg-white/5 rounded-full px-4 sm:px-5 py-2 max-w-full sm:max-w-[520px]">
          <span className="text-sm opacity-70 truncate">
            {referralLink}
          </span>
          <Button
            onClick={handleCopy}
            className="ml-auto h-8 px-4 rounded-full bg-purple-600 text-sm"
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: UsersIcon, label: "Total Referrals", value: "7" },
            { icon: ActiveIcon, label: "Active", value: "5" },
            { icon: TrustIcon, label: "Trust Earned", value: "5.4" }
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between bg-white/5 rounded-2xl px-5 sm:px-6 py-5"
            >
              <div>
                <p className="text-sm opacity-60">{label}</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-600/25 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-purple-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* HISTORY */}
        <Card className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-6">
          <div className="flex justify-between mb-4">
            <p className="text-sm font-medium">Referral History</p>
            <span className="text-sm text-purple-400 cursor-pointer">
              View all
            </span>
          </div>

          <div className="space-y-4">
            {[
              ["Madmoiselle", "Nov 4, 2025", "Inactive"],
              ["Shallipopi", "Nov 9, 2025", "Active"],
              ["Blacko", "Nov 15, 2025", "Active"],
              ["TFK", "Nov 25, 2025", "Active"],
              ["Mardocee", "Nov 29, 2025", "Active"],
              ["Ownyde", "Nov 29, 2025", "Active"],
              ["Emperor", "Nov 29, 2025", "Inactive"]
            ].map(([name, date, status]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{name}</span>
                </div>
                <span className="opacity-60">{date}</span>
                <span className={status === "Active" ? "text-green-400" : "opacity-40"}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* SIDE */}
        <div className="space-y-6">
          <Card className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 space-y-4">
            <p className="text-sm font-medium">Milestone Progress</p>
            <p className="text-sm text-purple-400">Next Reward: +10.8 Trust</p>
            <Progress value={50} />
            <Button
              onClick={handleClaim}
              disabled={rewardClaimed}
              className="w-full rounded-full bg-purple-600 text-sm disabled:opacity-60"
            >
              {rewardClaimed ? "Claimed" : "Claim Reward"}
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
