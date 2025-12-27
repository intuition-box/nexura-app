"use client";

import { useEffect, useState } from "react";
import { apiRequestV2 } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { url } from "@/lib/constants";
import { claimReferralReward } from "@/lib/performOnchainAction";
import { InviteIcon, RegisterIcon, EarnIcon, UsersIcon, ActiveIcon, TrustIcon } from "@/svgs/icons";

type Referral = {
  username: string;
  dateJoined: string;
  status: "Active" | "Inactive";
};

const refReward = 16.2;

const rewardPerActiveUser = 1.62;

const dummyReferralData: Referral[] = [
  { username: "Madmoiselle", dateJoined: "Nov 4, 2025", status: "Inactive" },
  { username: "Shallipopi", dateJoined: "Nov 9, 2025", status: "Active" },
  { username: "Blacko", dateJoined: "Nov 15, 2025", status: "Active" },
  { username: "TFK", dateJoined: "Nov 25, 2025", status: "Active" },
  { username: "Mardocee", dateJoined: "Nov 29, 2025", status: "Active" },
  { username: "Ownyde", dateJoined: "Nov 29, 2025", status: "Active" },
  { username: "Emperor", dateJoined: "Nov 29, 2025", status: "Inactive" }
];

export default function ReferralsPage() {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalReferrerls, setTotalReferrals] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [trustEarned, setTrustEarned] = useState<string | number>("0");

  const { user } = useAuth();

  const [referralData, setReferralData] = useState<Referral[]>(dummyReferralData);

  useEffect(() => {
    (async () => {
      const { usersReferred, refRewardClaimed } = await apiRequestV2("GET", "/api/user/referral-info");

      const ActiveUsers = usersReferred.filter((u: { status: string; }) => u.status === "Active").length;

      setReferralData(usersReferred);
      setRewardClaimed(refRewardClaimed);

      setTrustEarned(ActiveUsers < 10 ? (rewardPerActiveUser * ActiveUsers).toFixed(2) : refReward);
      setTotalReferrals(usersReferred.length);
      setActiveUsers(ActiveUsers);
    })()
  }, []);

  const referralLink = `${url}/ref/${user ? user.referral.code : "referral-noobmaster"}`;

  const progressBar = Math.round((parseFloat(trustEarned.toString()) / refReward) * 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleClaim = async () => {
    await apiRequestV2("POST", "/api/user/allow-ref-claim");

    await claimReferralReward(user._id);

    await apiRequestV2("POST", "/api/user/claim-referral-reward");

    setRewardClaimed(true);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-[1200px] mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Referrals</h1>
        <p className="text-sm opacity-60 mt-1">
          {`Invite your friends to Nexura and earn up to ${refReward} $TRUST`}
        </p>
      </div>

      {/* STEPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {[
          { icon: InviteIcon, title: "Send an invitation", desc: "Send your referral links to friends and tell them how cool Nexura is!" },
          { icon: RegisterIcon, title: "Registration", desc: "Let them register to our platform using your referral links" },
          { icon: EarnIcon, title: "Earn", desc: `You can earn up to ${refReward} TRUST referring your friends after they complete a Quest or Campaign` }
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/5 rounded-full px-4 sm:px-5 py-2 max-w-full sm:max-w-[520px]">
          <span className="text-sm opacity-70 truncate">
            {referralLink}
          </span>
          <Button
            onClick={handleCopy}
            className="sm:ml-auto h-8 px-4 rounded-full bg-purple-600 text-sm"
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: UsersIcon, label: "Total Referrals", value: totalReferrerls },
            { icon: ActiveIcon, label: "Active", value: activeUsers },
            { icon: TrustIcon, label: "Trust Earned", value: trustEarned }
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
            {referralData.length > 0 ? referralData.map(({ username, dateJoined, status }) => (
              <div key={username} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback>{username[0]}</AvatarFallback>
                  </Avatar>
                  <span>{username}</span>
                </div>
                <span className="opacity-60">{dateJoined}</span>
                {status === "Active" ? (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs rounded-full opacity-40 border border-white/10">
                    Inactive
                  </span>
                )}

              </div>
            )) : "No referrals yet"}
          </div>
        </Card>

        {/* SIDE */}
        <div className="space-y-6">
          <Card className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 space-y-4">
            <p className="text-sm font-medium">Milestone Progress</p>

            <p className="text-sm text-purple-400">
              Next Reward: +10.8 Trust
            </p>

            <Progress value={50} />

            <p className="text-xs text-white/60">
              Refer 5 more friends who complete a quest or campaign to unlock remaining bonus.
            </p>

            <Button
              onClick={handleClaim}
              disabled={rewardClaimed}
              className="w-full rounded-full bg-purple-600 text-sm disabled:opacity-60"
            >
              {rewardClaimed ? "Claimed" : "Claim Reward"}
            </Button>
          </Card>

          {/* IMPORTANT RULE */}
          <div className="space-y-6">
            <Card className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 space-y-3">
              <p className="text-sm font-medium">Important Rule</p>

              <p className="text-xs text-white/70">
                Referrals only count as <span className="text-white font-medium">“Active”</span> after they
                complete their <span className="text-white font-medium">first quest or campaign</span> on the platform.
              </p>

              <p className="text-xs text-white/70">
                You can refer up to <span className="text-white font-medium">10 people max</span>, and only
                <span className="text-white font-medium"> active referrals</span> qualify for rewards.
              </p>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};