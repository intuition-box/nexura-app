"use client";

import { useEffect, useState } from "react";
import { apiRequestV2 } from "../lib/queryClient";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";
import { url } from "../lib/constants";
import { claimReferralReward } from "../lib/performOnchainAction";
import { InviteIcon, RegisterIcon, EarnIcon, UsersIcon, ActiveIcon, TrustIcon } from "../svgs/icons";
import AnimatedBackground from "../components/AnimatedBackground";

type Referral = {
  username: string;
  dateJoined: string;
  status: "Active" | "Inactive";
};

const refReward = 16.2;
const rewardPerActiveUser = 1.62;

export default function ReferralsPage() {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalReferrerls, setTotalReferrals] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [trustEarned, setTrustEarned] = useState<string | number>("0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<Referral[]>([]);

  useEffect(() => {
    (async () => {
      const { usersReferred, refRewardClaimed } = await apiRequestV2("GET", "/api/user/referral-info");
      const ActiveUsers = usersReferred.filter((u: { status: string }) => u.status === "Active").length;
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
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    try {
      await claimReferralReward(user?._id || "");
      await apiRequestV2("POST", "/api/user/claim-referral-reward");
      setRewardClaimed(true);

      toast({ title: "Success", description: "Referral Reward Claimed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-8 space-y-12 relative overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 space-y-12 max-w-[1200px] mx-auto">

        {/* HEADER */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Referrals</h1>
          <p className="text-sm text-white/80 mt-1">
            Invite your friends to Nexura and earn exciting rewards
          </p>
        </div>

        {/* STEPS - Mobile */}
        <div className="block sm:hidden bg-white/5 rounded-2xl p-4 space-y-6">
          {[
            { icon: InviteIcon, title: "Send invitation", desc: "Send your referral links to friends!" },
            { icon: RegisterIcon, title: "Registration", desc: "They register using your referral links" },
            // { icon: EarnIcon, title: "Earn", desc: `Earn up to ${refReward} TRUST after they complete a quest` }
          ].map(({ icon: Icon, title, desc }, idx) => (
            <div key={title} className="flex flex-col items-center text-center space-y-2 relative animate-slide-up">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-purple-600/25">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-white/80">{desc}</p>

              {/* Arrow */}
              {idx < 2 && (
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/50 mt-2 animate-bounce-slow"></div>
              )}
            </div>
          ))}
        </div>

        {/* STEPS - Desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: InviteIcon, title: "Send invitation", desc: "Send your referral links to friends!" },
            { icon: RegisterIcon, title: "Registration", desc: "They register using your referral links" },
            // { icon: EarnIcon, title: "Earn", desc: `Earn up to ${refReward} TRUST after they complete a quest` }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center space-y-4 animate-slide-up">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-purple-600/25">
                <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <p className="text-sm lg:text-base font-medium">{title}</p>
              <p className="text-xs lg:text-sm text-white/80 max-w-[90%]">{desc}</p>
            </div>
          ))}
        </div>

        {/* REFERRAL LINK */}
        <div className="space-y-4 w-full animate-slide-up">
          <p className="text-base sm:text-lg font-medium">Share your referral link</p>
          <div className="flex flex-col sm:flex-row items-center bg-white/5 rounded-full p-2 sm:p-3 w-full">
            <span className="text-sm text-white/80 break-all sm:truncate w-full">{referralLink}</span>
            <Button
              onClick={handleCopy}
              className={`mt-2 sm:mt-0 sm:ml-auto rounded-full bg-purple-600 text-white text-sm px-4 py-2 flex-shrink-0 ${copied ? "animate-pop" : ""}`}
            >
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: UsersIcon, label: "Total Referrals", value: totalReferrerls },
            { icon: ActiveIcon, label: "Active", value: activeUsers },
            // { icon: TrustIcon, label: "Trust Earned", value: trustEarned }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex justify-between items-center bg-white/5 rounded-2xl p-4 w-full animate-slide-up">
              <div>
                <p className="text-sm text-white/80">{label}</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-purple-600/25">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* HISTORY + SIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 w-full bg-white/5 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-medium mb-4">Referral History</p>
            <div className="space-y-4">
              {referralData.length > 0 ? referralData.map(({ username, dateJoined, status }) => (
                <div key={username} className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm gap-2 sm:gap-0 animate-slide-up">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="w-7 h-7"><AvatarFallback>{username[0]}</AvatarFallback></Avatar>
                    <span>{username}</span>
                  </div>
                  <span className="text-white/80">{dateJoined}</span>
                  <span className={`px-3 py-1 text-xs rounded-full ${status === "Active"
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : "opacity-40 border border-white/10 text-white/80"}`}>
                    {status}
                  </span>
                </div>
              )) : "No referrals yet"}
            </div>
          </Card>

          {/* SIDE */}
          <div className="space-y-6">
            {/*<Card className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 space-y-4">
              <p className="text-sm font-medium text-white">Milestone Progress</p>
              <p className="text-sm text-white">Reward: +{refReward} Trust</p>
              <Progress value={progressBar} />
              <Button
                onClick={handleClaim}
                disabled={rewardClaimed || activeUsers < 10}
                className="w-full rounded-full bg-purple-600 text-white text-sm disabled:opacity-60"
              >
                {rewardClaimed ? "Claimed" : "Claim Reward"}
              </Button>
            </Card> */}

            <Card className="w-full bg-white/5 rounded-2xl p-6 space-y-3 animate-slide-up">
              <p className="text-sm font-medium">Important Rule</p>
              <p className="text-xs text-white/80">
                Referrals are only counted as <span className="font-medium">“active”</span> after they complete their <span className="font-medium">first quest or campaign</span>.
              </p>
              <p className="text-xs text-white/80">
                You can refer as many people as you want, but only a maximum of <span className="font-medium">10 active referrals</span> will qualify for referral rewards.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
