"use client";

import { useEffect, useState } from "react";
import { apiRequestV2 } from "../lib/queryClient";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
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

const MILESTONES = [
  { tier: 1, target: 10, reward: 1500, label: "Milestone 1" },
  { tier: 2, target: 20, reward: 2000, label: "Milestone 2" },
  { tier: 3, target: 30, reward: 2500, label: "Milestone 3" },
];
const TOTAL_XP = 6000;
const MAX_REFERRALS = 30;

export default function ReferralsPage() {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<Referral[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      const { usersReferred, refRewardClaimed } = await apiRequestV2("GET", "/api/user/referral-info");
      const active = usersReferred.filter((u: { status: string }) => u.status === "Active").length;
      setReferralData(usersReferred);
      setRewardClaimed(refRewardClaimed);
      setTotalReferrals(usersReferred.length);
      setActiveUsers(active);
    })();
  }, []);

  const referralLink = `${url}/ref/${user ? user.referral.code : "referral-noobmaster"}`;

  // Milestone logic
  const currentMilestoneIdx = MILESTONES.findIndex(m => activeUsers < m.target);
  const allMilestonesComplete = currentMilestoneIdx === -1;
  const milestone = allMilestonesComplete ? MILESTONES[MILESTONES.length - 1] : MILESTONES[currentMilestoneIdx];
  const prevTarget = currentMilestoneIdx > 0 ? MILESTONES[currentMilestoneIdx - 1].target : 0;
  const progressInMilestone = allMilestonesComplete ? 10 : Math.min(activeUsers - prevTarget, 10);
  const progressPercent = (progressInMilestone / 10) * 100;

  // XP earned from completed milestones
  const xpEarned = MILESTONES.reduce((sum, m) => activeUsers >= m.target ? sum + m.reward : sum, 0);

  // Can claim current milestone?
  const canClaimCurrent = !allMilestonesComplete && activeUsers >= milestone.target;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(`Join me on Nexura! ${referralLink}`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleClaim = async () => {
    try {
      await claimReferralReward(user?._id || "");
      await apiRequestV2("POST", "/api/user/claim-referral-reward");
      setRewardClaimed(true);
      toast({ title: "Success", description: "Referral Reward Claimed" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const displayedReferrals = showAll ? referralData : referralData.slice(0, 7);

  return (
    <div className="min-h-screen w-full bg-black text-white p-6 relative overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-[900px] mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-[40px] font-semibold text-white" style={{ fontFamily: "'Geist', sans-serif" }}>
            Referrals
          </h1>
          <p className="text-[18px] text-[#a3adc2] mt-2">
            Invite your friends to Nexura and you can earn up to {TOTAL_XP.toLocaleString()} XP
          </p>
        </div>

        {/* 3 STEPS */}
        <div className="flex items-start justify-between px-4 sm:px-8 relative">
          {/* Dashed connector lines */}
          <div className="absolute top-[50px] left-[calc(16.67%+50px)] right-[calc(83.33%-50px)] hidden sm:block">
            <svg width="100%" height="20" className="overflow-visible">
              <path d="M 0 10 Q 60 -15 120 10" stroke="rgba(138,63,252,0.3)" strokeWidth="2" strokeDasharray="6 4" fill="none" />
            </svg>
          </div>
          <div className="absolute top-[50px] left-[calc(50%-60px)] right-[calc(50%-60px)] hidden sm:block">
            <svg width="100%" height="20" className="overflow-visible">
              <path d="M 0 10 Q 60 -15 120 10" stroke="rgba(138,63,252,0.3)" strokeWidth="2" strokeDasharray="6 4" fill="none" />
            </svg>
          </div>

          {[
            { icon: InviteIcon, title: "Send an invitation", desc: "Send your referral link to friends and tell them how cool Nexura is!" },
            { icon: RegisterIcon, title: "Registration", desc: "Let them register to our platform using your referral link." },
            { icon: EarnIcon, title: "Earn", desc: `You can earn up to ${TOTAL_XP.toLocaleString()} XP referring your friends after they complete a Quest or Campaign` },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center w-[207px] gap-4">
              <div className="w-[100px] h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center">
                <Icon className="w-[40px] h-[40px] text-purple-300" />
              </div>
              <div className="space-y-3">
                <p className="text-[20px] sm:text-[24px] font-semibold text-white/70">{title}</p>
                <p className="text-[14px] text-[#a3adc2] leading-[23px]">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SHARE REFERRAL LINK */}
        <div className="space-y-4">
          <div>
            <h2 className="text-[28px] sm:text-[30px] font-semibold text-white">Share your referral link</h2>
            <p className="text-[14px] text-[#a3adc2] mt-2 leading-[23px]">
              You can share your referral link by copying and sending it or sharing it on your social media
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-between bg-[rgba(201,170,255,0.2)] rounded-[26px] h-[57px] px-[27px] flex-1">
              <span className="text-[14px] font-semibold text-white/60 truncate mr-4">
                {referralLink}
              </span>
              <button onClick={handleCopy} className="text-[16px] font-bold text-[#8a3ffc] flex-shrink-0 hover:opacity-80 transition-opacity">
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <button
              onClick={handleShareX}
              className="w-[57px] h-[57px] rounded-full bg-[rgba(201,170,255,0.2)] flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="flex gap-5 flex-col sm:flex-row">
          {[
            { icon: UsersIcon, label: "Total Referrals", value: totalReferrals },
            { icon: ActiveIcon, label: "Active", value: activeUsers },
            { icon: TrustIcon, label: "XP Earned", value: xpEarned.toLocaleString() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between bg-[rgba(201,170,255,0.2)] rounded-[26px] h-[108px] px-[30px] flex-1">
              <div>
                <p className="text-[18px] font-medium text-[#a3adc2] leading-[23px]">{label}</p>
                <p className="text-[30px] font-medium text-white mt-2 leading-[23px]">{value}</p>
              </div>
              <div className="w-[60px] h-[60px] flex items-center justify-center">
                <Icon className="w-[40px] h-[40px] text-purple-300/70" />
              </div>
            </div>
          ))}
        </div>

        {/* REFERRAL HISTORY */}
        <div className="bg-[rgba(201,170,255,0.2)] rounded-[26px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h3 className="text-[20px] font-semibold text-white">Referral History</h3>
            {referralData.length > 7 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[20px] font-semibold text-[#8a3ffc] hover:opacity-80 transition-opacity"
              >
                {showAll ? "Show less" : "View all"}
              </button>
            )}
          </div>

          {/* Table Header */}
          <div className="flex items-center justify-between px-[55px] py-[13px] bg-[#100923] border-y border-white/[0.16] text-[14px] font-semibold text-white/85">
            <span>User</span>
            <span>Signed Up</span>
            <span>Status</span>
          </div>

          {/* Table Rows */}
          {referralData.length > 0 ? (
            displayedReferrals.map(({ username, dateJoined, status }) => (
              <div key={username} className="flex items-center justify-between px-6 h-[62px] bg-[#2a223d] border-b border-white/[0.2] last:border-b-0">
                <div className="flex items-center gap-[13px] min-w-[150px]">
                  <Avatar className="w-[34px] h-[34px] ring-1 ring-black rounded-full">
                    <AvatarFallback className="bg-purple-800/60 text-purple-200 text-xs rounded-full">
                      {username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[18px] font-semibold text-white/85">{username}</span>
                </div>
                <span className="text-[18px] font-semibold text-white/85">{dateJoined}</span>
                <span className="text-[18px] font-semibold text-white/85">{status}</span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-white/50">No referrals yet</div>
          )}
        </div>

        {/* MILESTONE INDICATORS */}
        <div className="flex gap-3 justify-center">
          {MILESTONES.map((m, i) => {
            const completed = activeUsers >= m.target;
            const isCurrent = i === currentMilestoneIdx;
            return (
              <div key={m.tier} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                completed ? "bg-[#8a3ffc]/30 text-[#8a3ffc] border border-[#8a3ffc]/50" :
                isCurrent ? "bg-white/10 text-white border border-white/20" :
                "bg-white/5 text-white/30 border border-white/10"
              }`}>
                {completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4Z" /></svg>
                )}
                {m.label}: {m.reward.toLocaleString()} XP
              </div>
            );
          })}
        </div>

        {/* BOTTOM CARDS */}
        <div className="flex gap-5 flex-col lg:flex-row">
          {/* Milestone Progress */}
          <div className="bg-[rgba(201,170,255,0.2)] rounded-[26px] p-6 flex-1 space-y-4">
            <h3 className="text-[20px] font-semibold text-white">
              {allMilestonesComplete ? "All Milestones Complete!" : `${milestone.label} Progress`}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-medium text-[#a3adc2]">
                {allMilestonesComplete
                  ? <span className="font-bold text-[#8a3ffc]">{TOTAL_XP.toLocaleString()} XP Earned</span>
                  : <>Next Reward: <span className="font-bold text-[#8a3ffc]">+{milestone.reward.toLocaleString()} XP</span></>
                }
              </p>
              <div className="bg-white/20 rounded-[6px] px-2 py-0.5">
                <span className="text-[16px] font-semibold text-white/85">{progressInMilestone}/10</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-[20px] bg-white/[0.23] rounded-[6px] overflow-hidden">
              <div
                className="h-full bg-[#8a3ffc] rounded-r-[6px] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[14px] text-[#a3adc2] leading-[18px]">
              {allMilestonesComplete
                ? "You've completed all referral milestones. Thank you!"
                : `Refer ${10 - progressInMilestone} more friends who complete a quest or campaign to unlock ${milestone.label}`
              }
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleClaim}
                disabled={!canClaimCurrent || rewardClaimed}
                className="border border-[#8a3ffc] rounded-full px-8 py-1.5 text-[14px] font-bold text-white hover:bg-[#8a3ffc]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {allMilestonesComplete && rewardClaimed ? "All Claimed" : rewardClaimed ? "Claimed" : "Claim Reward"}
              </button>
            </div>
          </div>

          {/* Important Rule */}
          <div className="bg-[rgba(201,170,255,0.2)] rounded-[26px] p-6 flex-1 space-y-4">
            <div className="flex items-center gap-1.5">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#8a3ffc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <h3 className="text-[20px] font-semibold text-white">Important Rule</h3>
            </div>
            <p className="text-[16px] font-medium text-[#a3adc2] leading-[23px] pl-[45px]">
              Referrals only count as "Active" after they{" "}
              <span className="font-bold text-white/85">complete their first quest or campaign</span>{" "}
              on the platform
            </p>
            <p className="text-[16px] font-medium text-[#a3adc2] leading-[23px] pl-[45px]">
              You can refer up to <span className="font-bold text-white/85">{MAX_REFERRALS} people</span>{" "}
              <span className="font-semibold">max</span> and only active referrals qualify for rewards.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
