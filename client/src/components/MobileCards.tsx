"use client";

import { ResponsivePie } from "@nivo/pie";

interface MobileCardsProps {
  usersJoined: number;
  tasksCompleted: number;
  totalQuests: number;
  totalCampaigns: number;
  totalTrustDistributed: number;
  totalOnchainInteractions: number;
  totalOnchainClaims: number;
}

export default function MobileCards({
  usersJoined,
  tasksCompleted,
  totalQuests,
  totalCampaigns,
  totalTrustDistributed,
  totalOnchainInteractions,
  totalOnchainClaims,
}: MobileCardsProps) {
  const remaining = Math.max(totalOnchainInteractions - totalOnchainClaims, 0);
  const mints = Math.floor(remaining * 0.5);
  const payments = remaining - mints;
  const interactionData = [
    { id: 'Claims', label: 'Claims', value: Math.max(totalOnchainClaims, 0), color: '#a855f7' },
    { id: 'Mints', label: 'Mints', value: Math.max(mints, 0), color: '#3b82f6' },
    { id: 'Payments', label: 'Payments', value: Math.max(payments, 0), color: '#10b981' },
  ];
  const hasData = totalOnchainInteractions > 0;
  return (
    <div className="grid grid-cols-1 gap-3 w-full">

      {/* Row 1: Quests + Campaigns side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass shimmer-once rounded-2xl p-3 flex flex-col gap-2 border border-purple-500/40">
          <h2 className="text-purple-400 font-semibold text-[11px] uppercase tracking-wider leading-tight">
            Total Quests
          </h2>
          <p className="text-2xl font-bold text-purple-300 leading-none">{totalQuests}</p>
          <span className="text-white/40 text-[10px] uppercase tracking-wide">Created</span>
        </div>

        <div className="glass shimmer-once rounded-2xl p-3 flex flex-col gap-2 border border-purple-500/40">
          <h2 className="text-purple-400 font-semibold text-[11px] uppercase tracking-wider leading-tight">
            Total Campaigns
          </h2>
          <p className="text-2xl font-bold text-purple-300 leading-none">{totalCampaigns}</p>
          <span className="text-white/40 text-[10px] uppercase tracking-wide">Created</span>
        </div>
      </div>

      {/* Join vs Completion Ratio */}
      <div className="glass rounded-2xl p-4 flex flex-col items-center border border-purple-500/40">
        <h2 className="text-white font-bold text-sm mb-3">Join vs Completion Ratio</h2>

        <div className="relative w-36 h-36">
          <ResponsivePie
            data={[
              { id: "Tasks Completed", value: Math.min(tasksCompleted, usersJoined) },
              { id: "Users Not Completed", value: Math.max(usersJoined - tasksCompleted, 0) },
            ]}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            innerRadius={0.6}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={6}
            colors={["#3B82F6", "#833AFD"]}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            enableArcLinkLabels={false}
            enableArcLabels={false}
            animate={true}
            theme={{
              tooltip: {
                container: {
                  background: "#1a1a2e",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                },
              },
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-white font-bold text-lg leading-none">
              {usersJoined === 0
                ? "0"
                : ((Math.min(tasksCompleted, usersJoined) / usersJoined) * 100).toFixed(1)}%
            </p>
            <span className="text-white/60 text-[10px]">Completion</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 w-full">
          <div className="bg-gray-800/60 border border-white/10 rounded-lg px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <span className="text-white/80 text-xs">Users Joined</span>
            </div>
            <span className="text-white text-xs font-semibold">{usersJoined.toLocaleString()}</span>
          </div>
          <div className="bg-gray-800/60 border border-white/10 rounded-lg px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-white/80 text-xs">Tasks Completed</span>
            </div>
            <span className="text-white text-xs font-semibold">{tasksCompleted.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* $TRUST Distributed */}
      <div className="glass shimmer-once rounded-2xl p-3 border border-purple-500/40 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="text-white font-semibold text-[11px] uppercase tracking-wide leading-tight">
            $TRUST Distributed
          </h2>
          <div className="flex items-center gap-1.5">
            <img src="/trust-icon.png" alt="Trust" className="w-6 h-3.5 object-contain shrink-0" />
            <p className="text-xl font-semibold text-white truncate">{totalTrustDistributed.toLocaleString()}</p>
          </div>
        </div>
        <img src="/intuition-icon.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 opacity-80" />
      </div>

      {/* On-Chain Activity */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: "linear-gradient(135deg,#833AFD 0%,#6028c7 100%)", boxShadow: "0 6px 24px rgba(131,58,253,0.4)" }}
      >
        <h2 className="text-white font-bold text-sm text-center">On-Chain Activity</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 shrink-0">
            <ResponsivePie
              data={hasData ? interactionData : [{ id: 'None', label: 'None', value: 1, color: '#ffffff20' }]}
              margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
              innerRadius={0.62}
              padAngle={1.5}
              cornerRadius={4}
              activeOuterRadiusOffset={5}
              colors={hasData ? interactionData.map(d => d.color) : ['#ffffff20']}
              borderWidth={0}
              enableArcLinkLabels={false}
              enableArcLabels={false}
              animate={true}
              theme={{ tooltip: { container: { background: '#1a1a2e', color: '#fff', fontSize: '12px', padding: '6px 10px', borderRadius: '6px' } } }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-white font-bold text-base leading-none">{totalOnchainInteractions.toLocaleString()}</p>
              <span className="text-white/60 text-[9px] mt-0.5">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {interactionData.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-white/70 text-xs">{d.label}</span>
                </div>
                <span className="text-white text-xs font-semibold">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
