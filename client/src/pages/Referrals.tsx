"use client";

import { useEffect, useState } from "react";
import { apiRequestV2 } from "../lib/queryClient";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";
import { url } from "../lib/constants";
import { claimReferralReward } from "../lib/performOnchainAction";
import AnalyticsBackground from "../components/AnalyticsBackground";

type Referral = {
  username: string;
  signedUp: string;
  status: "Active" | "Inactive";
};

const MILESTONES = [
  { tier: 1, target: 10, reward: 2000, label: "Milestone 1" },
  { tier: 2, target: 20, reward: 3000, label: "Milestone 2" },
  { tier: 3, target: 30, reward: 5000, label: "Milestone 3" },
];
const TOTAL_XP = 10000;

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [claimedTier, setClaimedTier] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<Referral[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      const { usersReferred } = await apiRequestV2("GET", "/api/user/referral-info");
      const active = usersReferred.filter((u: { status: string }) => u.status === "Active").length;
      setReferralData(usersReferred);
      setTotalReferrals(usersReferred.length);
      setActiveUsers(active);
    })();
  }, []);

  useEffect(() => {
    if (user?.tier != null) setClaimedTier(user.tier);
  }, [user]);

  const referralLink = `${url}/ref/${user ? user.referral.code : "referral-noobmaster"}`;

  const allTiersClaimed = claimedTier >= 3;
  const milestone = MILESTONES[Math.min(claimedTier, MILESTONES.length - 1)];
  const prevTarget = claimedTier > 0 ? MILESTONES[claimedTier - 1].target : 0;
  const progressInMilestone = allTiersClaimed ? 10 : Math.min(Math.max(activeUsers - prevTarget, 0), 10);
  const progressPercent = (progressInMilestone / 10) * 100;
  const xpEarned = MILESTONES.slice(0, claimedTier).reduce((sum, m) => sum + m.reward, 0);
  const canClaimCurrent = !allTiersClaimed && activeUsers >= milestone.target;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `Entering a new ecosystem comes with little clarity on where to begin or how to participate meaningfully.\n\n@NexuraXYZ changes that. It helps users discover, understand, and contribute meaningfully on @0xIntuition while learning about Web3.\n\nJoin here 👇\n${referralLink}`
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleClaim = async () => {
    const nextTier = claimedTier + 1;
    try {
      // await claimReferralReward(user?._id || "");
      await apiRequestV2("POST", "/api/user/claim-referral-reward", { tier: nextTier });
      setClaimedTier(nextTier);
      toast({ title: "Success", description: `Milestone ${nextTier} reward claimed! +${MILESTONES[claimedTier].reward.toLocaleString()} XP` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const displayedReferrals = showAll ? referralData : referralData.slice(0, 7);

  return (
    <div className="min-h-screen w-full bg-black text-white p-3 sm:p-6 relative overflow-hidden">
      <AnalyticsBackground />

      <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-8 relative z-10">

        {/* HEADER */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Referrals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Referrals
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Invite your friends to Nexura and you can earn up to {TOTAL_XP.toLocaleString()} XP
          </p>
        </div>

        {/* 3 STEPS */}
        <div className="flex flex-col sm:flex-row justify-center relative items-start gap-4 sm:gap-28">
          {/* Wave arc connectors — geometry: step=207px, gap=112px, icon=100px centered in step → gap-between-icons=219px, arc1 center offset from container center = -159.5px, arc2 = +159.5px */}
          <svg
            className="absolute hidden sm:block pointer-events-none"
            style={{ top: 10, left: 'calc(50% - 269px)', width: 219, height: 80, opacity: 0.5 }}
            viewBox="0 0 219 80"
            fill="none"
          >
            <path
              d="M 0 40 Q 109.5 -20 219 40"
              stroke="#8a3ffc"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="absolute hidden sm:block pointer-events-none"
            style={{ top: 10, left: 'calc(50% + 50px)', width: 219, height: 80, opacity: 0.5 }}
            viewBox="0 0 219 80"
            fill="none"
          >
            <path
              d="M 0 40 Q 109.5 100 219 40"
              stroke="#8a3ffc"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Step 1: Send an invitation */}
          <div className="flex flex-row sm:flex-col items-center w-full sm:w-[207px] gap-3 sm:gap-5">
            <div className="w-[56px] h-[56px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/referral-icons/referral-icon.png" alt="" className="w-[34px] h-[34px] sm:w-[60px] sm:h-[60px] object-cover" />
            </div>
            <div className="flex flex-col sm:items-center gap-1 sm:gap-5 min-w-0">
              <p className="text-[15px] sm:text-[24px] font-semibold text-white/70 leading-tight">Send an invitation</p>
              <p className="text-[12px] sm:text-[14px] font-normal text-[#a3adc2] sm:text-center leading-[18px] sm:leading-[23px]">
                Send your referral link to friends and tell them how cool Nexura is!
              </p>
            </div>
          </div>

          {/* Step 2: Registration */}
          <div className="flex flex-row sm:flex-col items-center w-full sm:w-[207px] gap-3 sm:gap-[17px]">
            <div className="w-[56px] h-[56px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/referral-icons/registration-icon.png" alt="" className="w-[34px] h-[34px] sm:w-[60px] sm:h-[60px] object-cover" />
            </div>
            <div className="flex flex-col sm:items-center gap-1 sm:gap-5 min-w-0">
              <p className="text-[15px] sm:text-[24px] font-semibold text-white/70 leading-tight">Registration</p>
              <p className="text-[12px] sm:text-[14px] font-normal text-[#a3adc2] sm:text-center leading-[18px] sm:leading-[23px]">
                Let them register to our platform using your referral link.
              </p>
            </div>
          </div>

          {/* Step 3: Earn */}
          <div className="flex flex-row sm:flex-col items-center w-full sm:w-[207px] gap-3">
            <div className="w-[56px] h-[56px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/referral-icons/reward-icon.png" alt="" className="w-[34px] h-[34px] sm:w-[60px] sm:h-[60px] object-cover" />
            </div>
            <div className="flex flex-col sm:items-center gap-1 sm:gap-0 min-w-0">
              <p className="text-[15px] sm:text-[24px] font-semibold text-white/70 leading-tight">Earn</p>
              <p className="text-[12px] sm:text-[14px] font-normal text-[#a3adc2] sm:text-center leading-[18px] sm:leading-[23px] sm:mt-5">
                Earn up to {TOTAL_XP.toLocaleString()} XP when your friends complete a Quest or Campaign
              </p>
            </div>
          </div>
        </div>

        {/* SHARE REFERRAL LINK */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <h2 className="text-base sm:text-2xl font-semibold text-white shrink-0">
              Share your referral link
            </h2>
            <div className="h-[1px] flex-1 bg-[#FFFFFF33]" />
          </div>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Share your referral link by copying it or posting on social media
          </p>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 sm:max-w-xl">
            <div className="flex items-center justify-between glass rounded-xl sm:rounded-2xl h-[44px] sm:h-[57px] flex-1 min-w-0 px-3 sm:px-[27px]">
              <span className="text-[11px] sm:text-[14px] font-semibold text-white/60 truncate min-w-0">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="text-[13px] sm:text-[16px] font-bold text-[#8a3ffc] shrink-0 ml-2 sm:ml-4 hover:opacity-80 transition-opacity"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={handleShareX}
              className="w-[44px] h-[44px] sm:w-[57px] sm:h-[57px] rounded-full glass flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="sm:w-4 sm:h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {/* Total Referrals */}
          <div className="glass glass-hover rounded-2xl h-[80px] sm:h-[108px] flex items-center justify-between px-4 sm:px-[30px] overflow-hidden">
            <div className="min-w-0">
              <p className="text-[13px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
                Total Referrals
              </p>
              <p className="text-[22px] sm:text-[30px] font-medium text-white leading-[23px] mt-2 sm:mt-3">
                {totalReferrals}
              </p>
            </div>
            <img
              src="/referral-icons/referral-icon.png"
              alt=""
              className="w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] object-cover shrink-0"
            />
          </div>

          {/* Active */}
          <div className="glass glass-hover rounded-2xl h-[80px] sm:h-[108px] flex items-center justify-between px-4 sm:px-[30px] overflow-hidden">
            <div className="min-w-0">
              <p className="text-[13px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
                Active
              </p>
              <p className="text-[22px] sm:text-[30px] font-medium text-white leading-[23px] mt-2 sm:mt-3">
                {activeUsers}
              </p>
            </div>
            <img
              src="/referral-icons/active-icon.png"
              alt=""
              className="w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] object-cover shrink-0"
            />
          </div>

          {/* XP Earned */}
          <div className="glass glass-hover rounded-2xl h-[80px] sm:h-[108px] flex items-center justify-between px-4 sm:px-[30px] overflow-hidden">
            <div className="min-w-0">
              <p className="text-[13px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
                XP Earned
              </p>
              <p className="text-[22px] sm:text-[30px] font-medium text-white leading-[23px] mt-2 sm:mt-3">
                {xpEarned.toLocaleString()}
              </p>
            </div>
            <img
              src="/nexura-xp.png"
              alt=""
              className="w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] object-contain shrink-0"
            />
          </div>
        </div>

        {/* REFERRAL HISTORY */}
        <div className="glass rounded-2xl overflow-hidden w-full">
          <div className="flex items-center justify-between px-3 sm:px-[23px] py-3 sm:py-5">
            <h3 className="text-[14px] sm:text-[20px] font-semibold text-white leading-[18.2px]">
              Referral History
            </h3>
            {referralData.length > 7 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[13px] sm:text-[20px] font-semibold text-[#8a3ffc] leading-[18.2px] hover:opacity-80 transition-opacity"
              >
                {showAll ? "Show less" : "View all"}
              </button>
            )}
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-3 px-3 sm:px-[55px] py-[10px] sm:py-[13px] bg-[#100923] border border-white/[0.16] text-[12px] sm:text-[14px] font-semibold text-white/85 leading-[18.2px]">
            <span>User</span>
            <span className="hidden sm:block text-center">Signed Up</span>
            <span className="text-right">Status</span>
          </div>

          {/* Table Rows */}
          {referralData.length > 0 ? (
            displayedReferrals.map(({ username, signedUp, status }) => (
              <div
                key={username}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-3 items-center bg-[#2a223d] border border-white/[0.2] h-[48px] sm:h-[62px] px-3 sm:px-[23px]"
              >
                <div className="flex items-center gap-2 sm:gap-[13px] min-w-0">
                  <Avatar className="w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] ring-1 ring-black rounded-full shrink-0">
                    <AvatarFallback className="bg-purple-800/60 text-purple-200 text-[10px] sm:text-xs rounded-full">
                      {username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] sm:text-[18px] font-semibold text-white/85 leading-[18.2px] truncate">
                    {username}
                  </span>
                </div>
                <span className="hidden sm:block text-[18px] font-semibold text-white/85 leading-[18.2px] text-center">
                  {signedUp}
                </span>
                <span className="text-[12px] sm:text-[18px] font-semibold text-white/85 leading-[18.2px] text-right shrink-0 ml-2">
                  {status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-3 sm:px-6 py-6 sm:py-8 text-center text-white/50 text-sm bg-[#2a223d]">
              No referrals yet
            </div>
          )}
        </div>

        {/* BOTTOM CARDS */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
          {/* Milestone Progress */}
          <div className="glass glass-hover rounded-3xl flex-1 overflow-hidden p-4 sm:p-[26px] space-y-3">
            <h3 className="text-[14px] sm:text-[20px] font-semibold text-white leading-[18.2px]">
              Milestone Progress
            </h3>
            <p className="text-[14px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
              {allTiersClaimed ? (
                <span className="font-bold text-[#8a3ffc]">{TOTAL_XP.toLocaleString()} XP Earned</span>
              ) : (
                <>
                  Next Reward:{" "}
                  <span className="font-bold text-[#8a3ffc]">
                    +{milestone.reward.toLocaleString()} XP
                  </span>
                </>
              )}
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-end mb-1.5">
                <div className="bg-white/20 rounded-[6px] px-2 h-[22px] flex items-center justify-center">
                  <span className="text-[13px] sm:text-[14px] font-semibold text-white/85 leading-[18px]">
                    {progressInMilestone}/10
                  </span>
                </div>
              </div>
              <div className="h-[20px] bg-white/[0.23] rounded-[6px] overflow-hidden">
              <div
                className="h-full bg-[#8a3ffc] rounded-r-[6px] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
              </div>
            </div>
            <p className="text-[13px] sm:text-[14px] font-normal text-[#a3adc2] leading-[18px]">
              {allTiersClaimed
                ? "You've completed all referral milestones. Thank you!"
                : `Refer ${milestone.target - activeUsers > 0 ? milestone.target - activeUsers : 0} more active friends to unlock next reward`}
            </p>
            <div className="flex justify-center pt-1">
              <button
                onClick={handleClaim}
                disabled={!canClaimCurrent}
                className={`rounded-[33px] w-[217px] h-[30px] text-[14px] font-bold leading-[18px] transition-colors border ${
                  canClaimCurrent
                    ? "bg-transparent text-white border-[#8a3ffc] hover:bg-[#8a3ffc]/15 cursor-pointer"
                    : "bg-transparent text-white/30 border-[#8a3ffc] cursor-not-allowed"
                }`}
              >
                {allTiersClaimed ? "All Claimed" : "Claim Reward"}
              </button>
            </div>
          </div>

          {/* Important Rule */}
          <div className="glass glass-hover rounded-3xl flex-1 overflow-hidden p-4 sm:p-[26px]">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <img src="/referral-icons/info-icon.svg" alt="" className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] shrink-0" />
              <span className="text-[14px] sm:text-[20px] font-semibold text-white leading-[18.2px]">
                Important Rule
              </span>
            </div>
            <p className="text-[13px] sm:text-[16px] font-medium text-[#a3adc2] leading-[20px] sm:leading-[23px] pl-[38px] sm:pl-[45px]">
              Referrals only count as &ldquo;Active&rdquo; after they{" "}
              <span className="font-bold text-white/85">
                complete their first quest or campaign
              </span>
              .
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
